# ir-booking-summary



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type                                                                                                                                                  | Default     |
| ------------------ | ------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `error`            | --                  |             | `{ cause: "booking-details" \| "booking-summary"; issues: string; } \| { cause: "user" \| "pickup" \| "payment"; issues: Record<string, ZodIssue>; }` | `undefined` |
| `prepaymentAmount` | `prepayment-amount` |             | `any`                                                                                                                                                 | `null`      |


## Events

| Event               | Description | Type                                                                                       |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `bookingClicked`    |             | `CustomEvent<null>`                                                                        |
| `openPrivacyPolicy` |             | `CustomEvent<null>`                                                                        |
| `routing`           |             | `CustomEvent<"booking" \| "booking-listing" \| "checkout" \| "invoice" \| "user-profile">` |


## Dependencies

### Used by

 - [ir-checkout-page](..)

### Depends on

- [ir-button](../../../ui/ir-button)
- [ir-payment-view](ir-payment-view)
- [ir-checkbox](../../../ui/ir-checkbox)

### Graph
```mermaid
graph TD;
  ir-booking-summary --> ir-button
  ir-booking-summary --> ir-payment-view
  ir-booking-summary --> ir-checkbox
  ir-button --> ir-icons
  ir-payment-view --> ir-input
  ir-payment-view --> ir-credit-card-input
  ir-payment-view --> ir-select
  ir-checkout-page --> ir-booking-summary
  style ir-booking-summary fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
