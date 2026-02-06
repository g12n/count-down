/**
 *
 * @attribute {string} duration - Duration in ISO 8601 duration format
 * @attribute {string} locale - BCP 47 language tag
 * @attribute {string} duration-style - Duration format style: "long", "short", "narrow", or "digital" (default: "long")
 *
 * @property {Temporal.Duration} duration - duration object
 * @property {Intl.DurationFormat} formatter - Intl.DurationFormat
 *
 * @tagname formatted-duration
 */

export class DurationElement extends HTMLElement {
	static get observedAttributes() {
		return ["duration", "locale", "duration-style"];
	}

	constructor() {
		super();
		const locale = navigator.language || "en-US";
		this.durationStyle = "long";

		this.formatter = new Intl.DurationFormat(locale, {
			style: this.durationStyle,
		});
		this._initialized = false;
		this.duration = Temporal.Duration.from("P0D");
	}

	connectedCallback() {
		this._initialized = true;
		this.render();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === "duration") {
			try {
				this.duration = Temporal.Duration.from(newValue);
			} catch (e) {
				this.duration = Temporal.Duration.from("P0D");
			}
		} else if (name === "locale") {
			this.formatter = new Intl.DurationFormat(newValue, {
				style: this.durationStyle,
			});
		} else if (name === "duration-style") {
			this.durationStyle = newValue || "long";

			const locale =
				this.getAttribute("locale") || navigator.language || "en-US";
			this.formatter = new Intl.DurationFormat(locale, {
				style: this.durationStyle,
			});
		}
		if (this.isConnected && this._initialized) {
			this.render();
		}
	}

	render() {
		const parts = this.formatter.formatToParts(this.duration);
		const fragment = document.createDocumentFragment();
		for (const part of parts) {
			if (part.type === "literal") {
				fragment.appendChild(document.createTextNode(part.value));
				continue;
			}
			let partElement = document.createElement("span");
			partElement.classList.add(part.type);
			if (part.unit) partElement.classList.add(part.unit);
			partElement.textContent = part.value;
			fragment.appendChild(partElement);
		}
		this.replaceChildren(fragment);
	}
}
