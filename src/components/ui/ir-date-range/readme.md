# ir-date-range



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description | Type             | Default                     |
| --------------- | --------------- | ----------- | ---------------- | --------------------------- |
| `dateModifiers` | --              |             | `IDateModifiers` | `undefined`                 |
| `fromDate`      | --              |             | `Date`           | `null`                      |
| `locale`        | --              |             | `Locale`         | `enUS`                      |
| `maxDate`       | --              |             | `Date`           | `addYears(new Date(), 24)`  |
| `maxSpanDays`   | `max-span-days` |             | `number`         | `90`                        |
| `minDate`       | --              |             | `Date`           | `addYears(new Date(), -24)` |
| `showPrice`     | `show-price`    |             | `boolean`        | `false`                     |
| `toDate`        | --              |             | `Date`           | `null`                      |


## Events

| Event        | Description | Type                                       |
| ------------ | ----------- | ------------------------------------------ |
| `dateChange` |             | `CustomEvent<{ start: Date; end: Date; }>` |


## Dependencies

### Used by

 - [ir-booking-widget](../../ir-booking-widget)
 - [ir-date-popup](../../ir-booking-engine/ir-booking-page/ir-availibility-header/ir-date-popup)

### Graph
```mermaid
graph TD;
  ir-booking-widget --> ir-date-range
  ir-date-popup --> ir-date-range
  style ir-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
