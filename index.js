/**
 *
 * @attribute {string} duration - Duration in ISO 8601 duration format
 * @attribute {string} locale - BCP 47 language tag
 *
 * @property {object} duration - duration object
 * @property  formatter - Intl.DurationFormat
 *
 * @tagname formatted-duration
 */

export class DurationElement extends HTMLElement {
	static get observedAttributes() {
		return ["duration", "locale"];
	}
	connectedCallback() {
		if (!this.hasAttribute("locale")) {
			const locale = navigator.language || "de-DE";
			this.formatter = new Intl.DurationFormat(locale, {
				style: "long",
			});
		}

		if (!this.hasAttribute("duration")) {
			this.duration = { days: 0 };
		}
		this.render();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === "duration") {
			try {
				this.duration = Temporal.Duration.from(newValue);
			} catch (e) {
				this.duration = { days: 0 };
			}
		} else if (name === "locale") {
			this.formatter = new Intl.DurationFormat(newValue, {
				style: "long",
			});
		}
		this.render();
	}

	render() {
		if (!this.formatter || !this.duration) return;

		const parts = this.formatter.formatToParts(this.duration);

		this.innerHTML = parts
			.map(
				(part) =>
					`<span class="${part.type} ${part.unit}">${part.value}</span>`,
			)
			.join("");
	}
}
