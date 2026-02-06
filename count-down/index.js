/**
 *
 * @attribute {string} data-target-date- - Target date/time in ISO 8601 format
 *
 * @property {Temporal.DateTimeISO} targetDate - Target Date for countdown
 * @property {number} intervalId - setInterval ID for countdown updates
 *
 * @tagname count-down
 */

export class CountdownElement extends HTMLElement {
	static get observedAttributes() {
		return ["data-target-date"];
	}

	constructor() {
		super();
		this.targetDate = null;
		this.intervalId = null;
	}

	connectedCallback() {
		this.startCountdown();
	}

	disconnectedCallback() {
		this.stopCountdown();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		try {
			this.targetDate = Temporal.PlainDateTime.from(newValue);
		} catch {
			this.targetDate = null;
		}
	}

	startCountdown() {
		if (this.intervalId) {
			this.stopCountdown();
		}
		this.tick();
		this.intervalId = setInterval(() => {
			this.tick();
		}, 1000);
	}

	stopCountdown() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	tick() {
		if (!this.targetDate) return;

		const duration = Temporal.Now.plainDateTimeISO().until(this.targetDate, {
			largestUnit: this.dataset.largestUnit || "year",
			smallestUnit: "seconds",
		});

		if (duration.sign === -1) {
			this.stopCountdown();
			return;
		}

		this.setAttribute("duration", duration);
		this.querySelector("formatted-duration")?.setAttribute(
			"duration",
			duration,
		);
	}
}
