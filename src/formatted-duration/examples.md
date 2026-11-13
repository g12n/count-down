### Basic use

Give it an ISO 8601 duration. It works anywhere on the page and does not need `<count-down>`.

<html-demo>

```html
<formatted-duration duration="PT1H30M"></formatted-duration>
```

</html-demo>

### Pick a style

`duration-style` changes how units are written: `long` (default), `short`, `narrow` or `digital`.

<html-demo>

```html
<formatted-duration locale="en" duration="P1Y2M3DT4H5M6S" duration-style="long"></formatted-duration>
<formatted-duration locale="en" duration="P1Y2M3DT4H5M6S" duration-style="short"></formatted-duration>
<formatted-duration locale="en" duration="P1Y2M3DT4H5M6S" duration-style="narrow"></formatted-duration>
<formatted-duration locale="en" duration="PT1H5M6S" duration-style="digital"></formatted-duration>
```

</html-demo>

### Many languages

`locale` takes a BCP 47 tag. Without it the element uses the language of the visitor's browser, so
the same markup reads right for everyone. The last line below has no `locale`.

<html-demo>

```html
<formatted-duration locale="en" duration="P1Y1M3W2DT1H1M3S"></formatted-duration>
<formatted-duration locale="de" duration="P1Y1M3W2DT1H1M3S"></formatted-duration>
<formatted-duration locale="fr" duration="P1Y1M3W2DT1H1M3S"></formatted-duration>
<formatted-duration locale="ja" duration="P1Y1M3W2DT1H1M3S"></formatted-duration>
<formatted-duration locale="ar" duration="P1Y1M3W2DT1H1M3S"></formatted-duration>
<formatted-duration duration="P1Y1M3W2DT1H1M3S"></formatted-duration>
```

</html-demo>

### Everyday content

Cooking time, video length, trip length, a warranty: anything you would otherwise format by hand.

<html-demo>

```html
<p>Cooking time: <formatted-duration locale="en" duration="PT45M" style="display:inline"></formatted-duration></p>
<p>Video length: <formatted-duration locale="en" duration="PT3M45S" duration-style="digital" style="display:inline"></formatted-duration></p>
<p>Trip: <formatted-duration locale="en" duration="P2W3D" duration-style="short" style="display:inline"></formatted-duration></p>
<p>Warranty: <formatted-duration locale="en" duration="P2Y" style="display:inline"></formatted-duration></p>
```

</html-demo>

### Style the parts

Every number and unit is its own `<span>`, with the part type and the unit as class names
(for example `integer hour`, `unit hour`). Target them with CSS, for instance to emphasise the
numbers or to colour one unit.

<html-demo>

```html
<style>
	formatted-duration.accent .integer { font-size: 2rem; font-weight: 800; color: tomato; }
	formatted-duration.accent .unit { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; }
	formatted-duration.accent .minute { color: royalblue; }
</style>

<formatted-duration class="accent" locale="en" duration="PT2H30M"></formatted-duration>
```

</html-demo>

### Live preview from an input

Set the `duration` attribute from JavaScript and the text re-renders. Handy for a settings form that
shows what a value means.

<html-demo>

```html
<label>
	Minutes
	<input id="duration-demo-input" type="range" min="0" max="240" value="90" />
</label>
<formatted-duration id="duration-demo" locale="en" duration="PT90M"></formatted-duration>

<script>
	document.getElementById("duration-demo-input").addEventListener("input", (event) => {
		const total = Number(event.target.value);
		const duration = `PT${Math.floor(total / 60)}H${total % 60}M`;
		document.getElementById("duration-demo").setAttribute("duration", duration);
	});
</script>
```

</html-demo>

### Bad values fall back

An unparsable `duration` becomes zero (which renders as empty text), a malformed `locale` uses the browser language and an unknown
`duration-style` uses `long`. The element never throws; invalid `locale` and `duration-style` values
log a warning in the console.

<html-demo>

```html
<formatted-duration locale="en" duration="soon"></formatted-duration>
<formatted-duration locale="not a locale" duration="PT5M"></formatted-duration>
<formatted-duration locale="en" duration="PT5M" duration-style="huge"></formatted-duration>
```

</html-demo>
