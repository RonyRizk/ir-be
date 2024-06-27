# ir-booking-header



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type                                | Default            |
| --------------- | ---------------- | ----------- | ----------------------------------- | ------------------ |
| `activeLink`    | `active-link`    |             | `"all_booking" \| "single_booking"` | `'single_booking'` |
| `bookingNumber` | `booking-number` |             | `number`                            | `null`             |
| `mode`          | `mode`           |             | `"multi" \| "single"`               | `'multi'`          |


## Events

| Event         | Description | Type                                             |
| ------------- | ----------- | ------------------------------------------------ |
| `linkChanged` |             | `CustomEvent<"all_booking" \| "single_booking">` |


## Dependencies

### Used by

 - [ir-booking-listing](..)

### Graph
```mermaid
graph TD;
  ir-booking-listing --> ir-booking-header
  style ir-booking-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
