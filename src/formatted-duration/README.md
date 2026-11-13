# formatted-duration

Writes an ISO 8601 duration as localized text using `Intl.DurationFormat`.
Requires the `Temporal` and `Intl.DurationFormat` globals. Rendering replaces any authored children.

## Usage

```js
import "@g12n/time/formatted-duration/define"; // registers <formatted-duration>
```

```html
<formatted-duration></formatted-duration>
```

The class is exported from `@g12n/time/formatted-duration`.

## Attributes & Properties

Set attributes in HTML or the matching properties in JavaScript.

- `duration`: ISO 8601 duration to display (an unparsable value falls back to P0D)
  - Type: `string`
- `duration-style`: Duration format style: "long", "short", "narrow", or "digital" (default: "long"); an invalid value falls back to "long"
  - Type: `string`
- `locale`: BCP 47 language tag; an invalid tag falls back to navigator.language
  - Type: `string`
- `formatter`: Intl.DurationFormat (property only)
  - Type: `Intl.DurationFormat`

## Methods

Methods that can be called on the element.

- `render() => void`
- `updateFormatter() => void`: Rebuilds the formatter from the locale and duration-style attributes. An invalid value is reported with a warning and replaced by its default (navigator.language / "long"), so rendering never throws.
