# ir-payment-view



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type                         | Default     |
| ------------------ | ------------------- | ----------- | ---------------------------- | ----------- |
| `errors`           | --                  |             | `{ [x: string]: ZodIssue; }` | `undefined` |
| `prepaymentAmount` | `prepayment-amount` |             | `number`                     | `0`         |


## Dependencies

### Used by

 - [ir-booking-summary](..)

### Depends on

- [ir-input](../../../../ui/ir-input)
- [ir-credit-card-input](../../ir-credit-card-input)
- [ir-select](../../../../ui/ir-select)

### Graph
```mermaid
graph TD;
  ir-payment-view --> ir-input
  ir-payment-view --> ir-credit-card-input
  ir-payment-view --> ir-select
  ir-booking-summary --> ir-payment-view
  style ir-payment-view fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
