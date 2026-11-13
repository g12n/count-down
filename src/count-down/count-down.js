/**
 * Counts down to a target date and exposes its status as custom states.
 *
 * @attribute {string} target-date - Target date/time in ISO 8601 format
 * @attribute {string} largest-unit - Largest Temporal unit shown (e.g. "week", "day", "minute") (default: "year")
 * @attribute {string} smallest-unit - Smallest Temporal unit shown (default: "second")
 * @attribute {string} now-duration - Duration of the now state after the target date has passed (default: "P1D")
 * @attribute {boolean} recurring - countdown for recurring events like birthdays or christmas (default: false)
 * @attribute {string} interval - Interval of a recurring event (default: "P1Y")
 *
 * @property {Temporal.PlainDateTime|null} targetDate - Parsed target date
 * @property {number|null} intervalId - setInterval ID for countdown updates
 *
 * @cssState future - Target date is in the future
 * @cssState now - Target date is reached
 * @cssState past - Target date has passed
 * @cssState invalid - target-date or a unit could not be parsed
 *
 * @tagname count-down
 */

export class CountdownElement extends HTMLElement {
	static get observedAttributes() {
		return [
			"target-date",
			"largest-unit",
			"smallest-unit",
			"now-duration",
			"recurring",
			"interval",
		];
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

	setExclusiveState(active) {
		const states = ["future", "now", "past"];

		for (const state of states) {
			if (state === active) {
				this._internals.states.add(state);
			} else {
				this._internals.states.delete(state);
			}
		}
	}

	set status(val) {
		if (val > 0) this.setExclusiveState("future");
		else if (val === 0) this.setExclusiveState("now");
		else this.setExclusiveState("past");
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		if (name === "target-date") {
			try {
				this.targetDate = Temporal.PlainDateTime.from(newValue);
			} catch {
				this._internals.states.add("invalid");
				this.targetDate = null;
				return;
			}
			this._internals.states.delete("invalid");
		}

		// Apply the change right away; this also resumes a countdown that had
		// stopped because the previous target date was in the past.
		// Before connection, connectedCallback does the first start.
		if (this.isConnected) this.startCountdown();
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
		const compare = Temporal.PlainDateTime.compare;
		const now = Temporal.Now.plainDateTimeISO();

		const isRecurring =
			this.hasAttribute("recurring") &&
			this.getAttribute("recurring") !== "false";

		let nowDuration;
		let interval;
		try {
			nowDuration = Temporal.Duration.from(
				this.getAttribute("now-duration") || "P1D",
			);
			if (nowDuration.sign < 0) {
				throw new RangeError("now-duration must not be negative");
			}
			if (isRecurring) {
				interval = Temporal.Duration.from(
					this.getAttribute("interval") || "P1Y",
				);
				// A zero or negative interval would never advance the target
				if (interval.sign !== 1) {
					throw new RangeError("interval must be positive");
				}
			}
		} catch {
			this._internals.states.add("invalid");
			this.stopCountdown();
			return;
		}

		// targetDate stays the authored base; the current occurrence is derived from it
		let target = this.targetDate;
		if (isRecurring) {
			while (compare(now, target.add(nowDuration)) > 0) {
				target = target.add(interval);
			}
		}

		if (compare(now, target) >= 0) {
			this._internals.states.delete("invalid");
			this.setDuration("PT0S");
			if (compare(now, target.add(nowDuration)) <= 0) {
				this.setExclusiveState("now");
			} else {
				this.setExclusiveState("past");
				this.stopCountdown();
			}
			return;
		}

		let duration;
		try {
			duration = now.until(target, {
				largestUnit: this.getAttribute("largest-unit") || "year",
				smallestUnit: this.getAttribute("smallest-unit") || "second",
			});
		} catch {
			// e.g. an unknown unit, or largest-unit smaller than smallest-unit
			this._internals.states.add("invalid");
			this.stopCountdown();
			return;
		}
		this._internals.states.delete("invalid");

		this.status = duration.sign;
		this.setDuration(duration.toString());
	}

	setDuration(value) {
		this.setAttribute("duration", value);
		this.querySelector("formatted-duration")?.setAttribute("duration", value);
	}
}
