# ir-booking-details



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `errors` | `errors`  |             | `string` | `undefined` |


## Events

| Event              | Description | Type                  |
| ------------------ | ----------- | --------------------- |
| `prepaymentChange` |             | `CustomEvent<number>` |


## Dependencies

### Used by

 - [ir-checkout-page](..)

### Depends on

- [ir-icons](../../../ui/ir-icons)
- [ir-select](../../../ui/ir-select)
- [ir-tooltip](../../../ui/ir-tooltip)
- [ir-input](../../../ui/ir-input)

### Graph
```mermaid
graph TD;
  ir-booking-details --> ir-icons
  ir-booking-details --> ir-select
  ir-booking-details --> ir-tooltip
  ir-booking-details --> ir-input
  ir-checkout-page --> ir-booking-details
  style ir-booking-details fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
