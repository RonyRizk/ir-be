# ir-calendar



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description | Type             | Default                     |
| --------------- | --------------- | ----------- | ---------------- | --------------------------- |
| `date`          | --              |             | `Date`           | `new Date()`                |
| `dateModifiers` | --              |             | `IDateModifiers` | `undefined`                 |
| `fromDate`      | --              |             | `Date`           | `null`                      |
| `locale`        | --              |             | `Locale`         | `enUS`                      |
| `maxDate`       | --              |             | `Date`           | `addYears(new Date(), 24)`  |
| `maxSpanDays`   | `max-span-days` |             | `number`         | `90`                        |
| `minDate`       | --              |             | `Date`           | `addYears(new Date(), -24)` |
| `showPrice`     | `show-price`    |             | `boolean`        | `false`                     |
| `toDate`        | --              |             | `Date`           | `null`                      |


## Events

| Event        | Description | Type                |
| ------------ | ----------- | ------------------- |
| `dateChange` |             | `CustomEvent<Date>` |


## Dependencies

### Used by

 - [ir-pickup](../../ir-booking-engine/ir-checkout-page/ir-pickup)

### Graph
```mermaid
graph TD;
  ir-pickup --> ir-calendar
  style ir-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
