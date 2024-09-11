# ir-credit-card-input



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default     |
| -------- | --------- | ----------- | -------- | ----------- |
| `value`  | `value`   |             | `string` | `undefined` |


## Events

| Event              | Description | Type                                                                                |
| ------------------ | ----------- | ----------------------------------------------------------------------------------- |
| `creditCardChange` |             | `CustomEvent<{ value: string; cardType: "" \| "AMEX" \| "VISA" \| "Mastercard"; }>` |


## Dependencies

### Used by

 - [ir-payment-view](../ir-booking-summary/ir-payment-view)

### Graph
```mermaid
graph TD;
  ir-payment-view --> ir-credit-card-input
  style ir-credit-card-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
