# ir-booking-summary



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `error`     | `error`      |             | `boolean` | `undefined` |
| `isLoading` | `is-loading` |             | `boolean` | `false`     |


## Events

| Event            | Description | Type                                                                     |
| ---------------- | ----------- | ------------------------------------------------------------------------ |
| `bookingClicked` |             | `CustomEvent<null>`                                                      |
| `routing`        |             | `CustomEvent<"booking" \| "booking-listing" \| "checkout" \| "invoice">` |


## Dependencies

### Used by

 - [ir-checkout-page](..)

### Depends on

- [ir-button](../../../ui/ir-button)
- [ir-payment-view](ir-payment-view)
- [ir-checkbox](../../../ui/ir-checkbox)
- [ir-privacy-policy](../../ir-privacy-policy)

### Graph
```mermaid
graph TD;
  ir-booking-summary --> ir-button
  ir-booking-summary --> ir-payment-view
  ir-booking-summary --> ir-checkbox
  ir-booking-summary --> ir-privacy-policy
  ir-button --> ir-icons
  ir-payment-view --> ir-input
  ir-payment-view --> ir-credit-card-input
  ir-payment-view --> ir-select
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-dialog --> ir-button
  ir-checkout-page --> ir-booking-summary
  style ir-booking-summary fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
