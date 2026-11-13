# count-down

Counts down to a target date and exposes its status as custom states.

## Usage

```js
import "@g12n/time/count-down/define"; // registers <count-down>
```

```html
<count-down></count-down>
```

The class is exported from `@g12n/time/count-down`.

## Attributes & Properties

Set attributes in HTML or the matching properties in JavaScript.

- `interval`: Interval of a recurring event (default: "P1Y")
  - Type: `string`
- `largest-unit`: Largest Temporal unit shown (e.g. "week", "day", "minute") (default: "year")
  - Type: `string`
- `now-duration`: Duration of the now state after the target date has passed (default: "P1D")
  - Type: `string`
- `recurring`: countdown for recurring events like birthdays or christmas (default: false)
  - Type: `boolean`
- `smallest-unit`: Smallest Temporal unit shown (default: "second")
  - Type: `string`
- `target-date`: Target date/time in ISO 8601 format
  - Type: `string`
- `status`: (property only)
  - Type: `any`
- `targetDate`: Parsed target date (property only)
  - Type: `Temporal.PlainDateTime|null`

## Methods

Methods that can be called on the element.

- `setDuration(value) => void`
- `startCountdown() => void`
- `stopCountdown() => void`

## CSS States

Match these with the `:state()` pseudo-class.

- `:state(future)`: Target date is in the future
- `:state(invalid)`: target-date or a unit could not be parsed
- `:state(now)`: Target date is reached
- `:state(past)`: Target date has passed
