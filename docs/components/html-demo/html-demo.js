/**
 * <html-demo>
 *
 * Renders a live demo from the css, js and html code blocks inside it.
 * The code blocks always stay in the light DOM and are only read, never moved.
 * See html-demo-briefing.md for the full contract.
 */

const LANGUAGES = {
	css: "css",
	js: "js",
	javascript: "js",
	html: "html",
	markup: "html",
};

const OUTPUT_ATTR = "data-html-demo-output";
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const SUPPORTS_SCOPE = typeof CSSScopeRule !== "undefined";

/** Language of a code element, from a language-* / lang-* class on it or its <pre>. */
function languageOf (code) {
	for (const el of [code, code.parentElement]) {
		for (const cls of el?.classList ?? []) {
			const match = /^(?:language|lang)-(.+)$/i.exec(cls);
			const language = match && LANGUAGES[match[1].toLowerCase()];

			if (language) {
				return language;
			}
		}
	}

	return null;
}

export default class HTMLDemoElement extends HTMLElement {
	static observedAttributes = ["isolate", "norun"];

	#demo;
	#observer;
	#output = null; // generated light-DOM element (no isolation only)
	#key = null;
	#scheduled = false;
	#css = "";
	#js = "";
	#html = "";

	constructor () {
		super();

		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `
			<style>:host { display: block; }</style>
			<slot name="demo"><div id="demo" part="demo"></div></slot>
			<slot></slot>
		`;

		this.#demo = root.getElementById("demo");
		this.#observer = new MutationObserver(() => this.#schedule());
		this.addEventListener("command", event => this.#onCommand(event));
	}

	connectedCallback () {
		this.#observer.observe(this, { childList: true, subtree: true, characterData: true });
		this.#schedule();
	}

	disconnectedCallback () {
		this.#observer.disconnect();
	}

	attributeChangedCallback () {
		if (this.isConnected) {
			this.#schedule();
		}
	}

	/** @type {"none" | "shadow" | "iframe"} */
	get isolate () {
		if (!this.hasAttribute("isolate")) {
			return "none";
		}

		return this.getAttribute("isolate") === "iframe" ? "iframe" : "shadow";
	}

	/** Composed CSS, JS and HTML as of the last render */
	get css () { return this.#css; }
	get js () { return this.#js; }
	get html () { return this.#html; }

	/** The demo as a standalone HTML document, as used in iframe mode */
	get srcdoc () {
		const base = document.baseURI.replaceAll('"', "&quot;");
		const style = this.#css ? `<style>\n${ this.#css }\n</style>` : "";
		const script = this.#js && !this.hasAttribute("norun")
			? `<script>\n${ this.#js.replaceAll("</script", "<\\/script") }\n</script>`
			: "";

		return `<!DOCTYPE html>
<base href="${ base }">
<meta name="responsive-embedded-sizing" content="allow-origins=*">
${ style }
${ this.#html }
${ script }`;
	}

	#schedule () {
		if (this.#scheduled) {
			return;
		}

		this.#scheduled = true;
		queueMicrotask(() => {
			this.#scheduled = false;
			this.#render();
		});
	}

	/** Collect the text of all recognized code blocks, per language */
	#collect () {
		const found = { css: [], js: [], html: [] };

		for (const code of this.querySelectorAll("pre > code")) {
			// Skip blocks of nested demos and anything inside the generated output
			if (code.closest("html-demo") !== this || code.closest(`[${ OUTPUT_ATTR }]`)) {
				continue;
			}

			const language = languageOf(code);

			if (language) {
				found[language].push(code.textContent.replace(/\n+$/, ""));
			}
		}

		return {
			css: found.css.join("\n"),
			js: found.js.join("\n"),
			html: found.html.join("\n"),
		};
	}

	#render () {
		const { css, js, html } = this.#collect();
		const isolate = this.isolate;
		const run = !this.hasAttribute("norun");

		// Highlighters and our own output mutate the DOM: only re-render on real changes
		const key = JSON.stringify([css, js, html, isolate, run]);

		if (key === this.#key) {
			return;
		}

		this.#key = key;
		this.#css = css;
		this.#js = js;
		this.#html = html;

		this.#output?.remove();
		this.#output = null;
		this.#demo.replaceChildren();

		if (css || js || html) {
			try {
				this.#mount(isolate, run);
			}
			catch (error) {
				this.#fail(error);
			}
		}

		this.dispatchEvent(new CustomEvent("html-demo-render", {
			detail: { css, js, html, isolate },
		}));
	}

	#mount (isolate, run) {
		if (isolate === "iframe") {
			const iframe = document.createElement("iframe");
			iframe.part = "iframe";
			iframe.title = "Demo";
			iframe.srcdoc = this.srcdoc;
			this.#demo.append(iframe);
			return;
		}

		let target;

		if (isolate === "shadow") {
			const host = document.createElement("div");
			host.part = "root";
			target = host.attachShadow({ mode: "open" });
			this.#demo.append(host);
		}
		else {
			target = this.#output = document.createElement("div");
			target.slot = "demo";
			target.setAttribute(OUTPUT_ATTR, "");
			this.append(target);
		}

		if (this.#css) {
			const style = document.createElement("style");
			// An @scope with no prelude scopes the rules to the style element's parent
			style.textContent = isolate === "none" && SUPPORTS_SCOPE
				? `@scope {\n${ this.#css }\n}`
				: this.#css;
			target.append(style);
		}

		// A template keeps scripts in the html block inert: scripts belong in the js block
		const template = document.createElement("template");
		template.innerHTML = this.#html;
		target.append(template.content);

		if (this.#js && run) {
			new AsyncFunction("root", this.#js)(target).catch(error => this.#fail(error));
		}
	}

	#onCommand (event) {
		const match = /^--copy-(css|js|html|all)$/.exec(event.command);

		if (!match) {
			return;
		}

		const kind = match[1];
		const text = kind === "all"
			? [this.#css, this.#html, this.#js].filter(Boolean).join("\n\n")
			: this[kind];

		navigator.clipboard.writeText(text).then(
			() => this.dispatchEvent(new CustomEvent("html-demo-copy", { detail: { kind, text } })),
			error => this.#fail(error),
		);
	}

	#fail (error) {
		const proceed = this.dispatchEvent(new CustomEvent("html-demo-error", {
			detail: { error },
			cancelable: true,
		}));

		if (proceed) {
			console.error(error);
		}
	}
}

if (!customElements.get("html-demo")) {
	customElements.define("html-demo", HTMLDemoElement);
}
