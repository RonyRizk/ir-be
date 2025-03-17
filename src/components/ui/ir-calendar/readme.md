# ir-calendar



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description | Type             | Default                      |
| --------------- | --------------- | ----------- | ---------------- | ---------------------------- |
| `date`          | --              |             | `Moment`         | `moment()`                   |
| `dateModifiers` | --              |             | `IDateModifiers` | `undefined`                  |
| `fromDate`      | --              |             | `Moment`         | `null`                       |
| `locale`        | `locale`        |             | `string`         | `'en'`                       |
| `maxDate`       | --              |             | `Moment`         | `moment().add(24, 'years')`  |
| `maxSpanDays`   | `max-span-days` |             | `number`         | `90`                         |
| `minDate`       | --              |             | `Moment`         | `moment().add(-24, 'years')` |
| `showPrice`     | `show-price`    |             | `boolean`        | `false`                      |
| `toDate`        | --              |             | `Moment`         | `null`                       |


## Events

| Event        | Description | Type                  |
| ------------ | ----------- | --------------------- |
| `dateChange` |             | `CustomEvent<Moment>` |


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
