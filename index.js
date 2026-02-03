/**
 *
 *
 * @attribute {string} duration - Duration in ISO 8601 duration format
 * @attribute {string} locale - BCP 47 language tag
 *
 * @tagname formatted-duration
 */

export class DurationElement extends HTMLElement {
	connectedCallback() {
		this.locale = this.getAttribute("locale") || navigator.language || "de-DE";
		this.formatter = new Intl.DurationFormat(this.locale, { style: "long" });
		this.render();
	}

	render() {
		const durationString = this.getAttribute("duration") || "P1D";

		try {
			const duration = Temporal.Duration.from(durationString);
			this.textContent = this.formatter.format(duration);
		} catch (e) {
			this.textContent = "–";
		}
	}
}
