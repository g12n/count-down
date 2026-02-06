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
		this._internals = this.attachInternals();
		this.targetDate = null;
		this.intervalId = null;
	}

	connectedCallback() {
		this.startCountdown();
	}

	disconnectedCallback() {
		this.stopCountdown();
	}

	set status(val) {
		if (val > 0) {
			this._internals.states.add("future");
			this._internals.states.delete("now");
			this._internals.states.delete("past");
		} else if (val === 0) {
			this._internals.states.delete("future");
			this._internals.states.add("now");
			this._internals.states.delete("past");
		} else {
			this._internals.states.delete("future");
			this._internals.states.delete("now");
			this._internals.states.add("past");
		}
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		try {
			this.targetDate = Temporal.PlainDateTime.from(newValue);
		} catch {
			this._internals.states.add("invalid");
			this.targetDate = null;
			return;
		}
		this._internals.states.delete("invalid");
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
		const now = Temporal.Now.plainDateTimeISO();

		this.status = Temporal.PlainDateTime.compare(this.targetDate, now);

		const duration = now.until(this.targetDate, {
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
