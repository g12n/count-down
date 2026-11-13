### Launch countdown

Point `target-date` at a moment (ISO 8601, no time zone: it is the visitor's local time) and put a
`<formatted-duration>` inside. The countdown writes the time left into it every second.

<html-demo>

```html
<count-down target-date="2030-01-01T00:00">
	<formatted-duration locale="en"></formatted-duration>
</count-down>
```

</html-demo>

### Choose the units

`largest-unit` and `smallest-unit` decide what is shown. Everything larger than the largest unit is
rolled into it, so a sale that ends in 3 weeks can read "21 days" or "504 hours".

<html-demo>

```html
<count-down
	target-date="2030-01-01T00:00"
	largest-unit="day"
	smallest-unit="hour"
>
	<formatted-duration locale="en"></formatted-duration>
</count-down>

<count-down
	target-date="2030-01-01T00:00"
	largest-unit="week"
	smallest-unit="minute"
>
	<formatted-duration locale="en" duration-style="short"></formatted-duration>
</count-down>
```

</html-demo>

### Localized for your visitors

The countdown only writes the duration. The text comes from `<formatted-duration>`, so set `locale`
and `duration-style` there.

<html-demo>

```html
<count-down target-date="2030-01-01T00:00" largest-unit="day">
	<formatted-duration locale="de"></formatted-duration>
</count-down>

<count-down target-date="2030-01-01T00:00" largest-unit="day">
	<formatted-duration locale="ja" duration-style="narrow"></formatted-duration>
</count-down>
```

</html-demo>

### Event is live right now

When the target is reached the state switches to `now` and stays there for `now-duration`
(default one day). Use it for a conference, a sale or a stream that runs for a while. This example
started on 1 November 2026 and lasts a year.

<html-demo>

```html
<count-down target-date="2026-11-01T00:00" now-duration="P1Y">
	<formatted-duration locale="en"></formatted-duration>
</count-down>
```

</html-demo>

### Event is over

After the `now` window the state is `past` and the countdown stops ticking. The stylesheet on this
page hides the duration in that state; you decide what to show instead.

<html-demo>

```html
<count-down target-date="2021-12-15" now-duration="PT1H">
	<formatted-duration locale="en"></formatted-duration>
</count-down>
```

</html-demo>

### Recurring dates

Birthdays, holidays or a weekly stand-up come back again. Add `recurring` and an `interval`, and the
countdown picks the next occurrence on its own, so you never have to update the date. The first
countdown below runs to every 24 December, the second to every Monday at 09:00 (2024-01-01 was a
Monday) and shows `now` for an hour.

<html-demo>

```html
<count-down
	target-date="2000-12-24T18:00"
	recurring
	interval="P1Y"
	largest-unit="day"
>
	<formatted-duration locale="en"></formatted-duration>
</count-down>

<count-down
	target-date="2024-01-01T09:00"
	recurring
	interval="P1W"
	now-duration="PT1H"
	largest-unit="day"
	smallest-unit="minute"
>
	<formatted-duration locale="en"></formatted-duration>
</count-down>
```

</html-demo>

### Style the states

Each state is a custom state, so plain CSS reacts to it with `:state()`. No JavaScript and no class
names to toggle.

<html-demo>

```html
<style>
	count-down.promo:state(future) { --color-text: royalblue; }
	count-down.promo:state(now) { --color-text: seagreen; }
	count-down.promo:state(now)::after { content: "Live now: go and get it!"; color: seagreen; }
	count-down.promo:state(past)::after { content: "This offer has ended."; }
</style>

<count-down class="promo" target-date="2030-01-01T00:00" largest-unit="day">
	<formatted-duration locale="en"></formatted-duration>
</count-down>

<count-down class="promo" target-date="2026-11-01T00:00" now-duration="P1Y">
	<formatted-duration locale="en"></formatted-duration>
</count-down>

<count-down class="promo" target-date="2021-12-15">
	<formatted-duration locale="en"></formatted-duration>
</count-down>
```

</html-demo>

### Wrong input is visible

A `target-date` that cannot be parsed, a unit name that does not exist or `largest-unit` smaller than
`smallest-unit` set the `invalid` state instead of throwing. Style it, or hide the element.

<html-demo>

```html
<count-down target-date="soon">
	<formatted-duration locale="en"></formatted-duration>
</count-down>

<count-down target-date="2030-01-01" largest-unit="second" smallest-unit="day">
	<formatted-duration locale="en"></formatted-duration>
</count-down>
```

</html-demo>

### Change the target from JavaScript

Setting `target-date` restarts the countdown right away, which also revives one that has already
ended. This is how you build a timer: use `Temporal.Now` to compute a date relative to now.

<html-demo>

```html
<count-down id="timer-demo" target-date="2030-01-01T00:00" now-duration="PT5S" largest-unit="minute">
	<formatted-duration locale="en" duration-style="digital"></formatted-duration>
</count-down>
<button id="timer-demo-start">Start 10 second timer</button>

<script>
	document.getElementById("timer-demo-start").addEventListener("click", () => {
		const end = Temporal.Now.plainDateTimeISO().add({ seconds: 10 });
		document.getElementById("timer-demo").setAttribute("target-date", end.toString());
	});
</script>
```

</html-demo>

### Without a child element

`<count-down>` also writes the raw ISO 8601 duration to its own `duration` attribute. You can read it
in CSS or JavaScript if you want to render the time yourself.

<html-demo>

```html
<style>
	count-down.raw formatted-duration { display: none; }
	count-down.raw:state(future)::after { content: "duration = " attr(duration); font-family: monospace; }
</style>

<count-down class="raw" target-date="2030-01-01T00:00" largest-unit="day">
	<formatted-duration></formatted-duration>
</count-down>
```

</html-demo>
