/**
 * Writes an ISO 8601 duration as localized text using `Intl.DurationFormat`.
 * Requires the `Temporal` and `Intl.DurationFormat` globals. Rendering replaces any authored children.
 *
 * @attribute {string} duration - ISO 8601 duration to display (an unparsable value falls back to P0D)
 * @attribute {string} locale - BCP 47 language tag; an invalid tag falls back to navigator.language
 * @attribute {string} duration-style - Duration format style: "long", "short", "narrow", or "digital" (default: "long"); an invalid value falls back to "long"
 *
 * @property {Temporal.Duration} duration - duration object
 * @property {Intl.DurationFormat} formatter - Intl.DurationFormat
 *
 * @tagname formatted-duration
 */

export class DurationElement extends HTMLElement {
	static styles = ["long", "short", "narrow", "digital"];

	static get observedAttributes() {
		return ["duration", "locale", "duration-style"];
	}

	constructor() {
		super();
		this.durationStyle = "long";
		this.updateFormatter();
		this._initialized = false;
		this.duration = Temporal.Duration.from("P0D");
	}

	connectedCallback() {
		this._initialized = true;
		this.render();
	}

	/**
	 * Rebuilds the formatter from the locale and duration-style attributes.
	 * An invalid value is reported with a warning and replaced by its default
	 * (navigator.language / "long"), so rendering never throws.
	 */
	updateFormatter() {
		const fallbackLocale = navigator.language || "en-US";
		const localeAttr = this.getAttribute("locale");
		const styleAttr = this.getAttribute("duration-style");

		let locale = fallbackLocale;
		if (localeAttr) {
			try {
				// Throws a RangeError for a malformed BCP 47 tag
				locale = Intl.getCanonicalLocales(localeAttr)[0];
			} catch {
				console.warn(
					`<formatted-duration>: invalid locale "${localeAttr}", using "${fallbackLocale}"`,
				);
			}
		}

		let style = "long";
		if (styleAttr) {
			if (DurationElement.styles.includes(styleAttr)) {
				style = styleAttr;
			} else {
				console.warn(
					`<formatted-duration>: invalid duration-style "${styleAttr}", using "long" (expected ${DurationElement.styles.join(", ")})`,
				);
			}
		}

		this.durationStyle = style;
		this.formatter = new Intl.DurationFormat(locale, { style });
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === "duration") {
			try {
				this.duration = Temporal.Duration.from(newValue);
			} catch (e) {
				this.duration = Temporal.Duration.from("P0D");
			}
		} else {
			// locale or duration-style
			this.updateFormatter();
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
