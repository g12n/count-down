/**
 *
 * @attribute {string} duration - Duration in ISO 8601 duration format
 * @attribute {string} locale - BCP 47 language tag
 *
 * @property {Temporal.Duration} duration - duration object
 * @property {Intl.DurationFormat} formatter - Intl.DurationFormat
 *
 * @tagname formatted-duration
 */

export class DurationElement extends HTMLElement {
	static get observedAttributes() {
		return ["duration", "locale"];
	}

	constructor() {
		super();
		const locale = navigator.language || "en-US";
		this.formatter = new Intl.DurationFormat(locale, { style: "long" });
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
				style: "long",
			});
		}
		if (this.isConnected && this._initialized) {
			this.render();
		}
	}

	render() {
		const parts = this.formatter.formatToParts(this.duration);
		this.innerHTML = parts
			.map(
				(part) =>
					`<span class="${part.type} ${part.unit || ''}">${part.value}</span>`,
			)
			.join("");
	}
}
