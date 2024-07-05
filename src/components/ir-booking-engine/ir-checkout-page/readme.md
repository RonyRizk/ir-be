# ir-checkout-page



<!-- Auto Generated Below -->


## Events

| Event     | Description | Type                                                                                       |
| --------- | ----------- | ------------------------------------------------------------------------------------------ |
| `routing` |             | `CustomEvent<"booking" \| "booking-listing" \| "checkout" \| "invoice" \| "user-profile">` |


## Dependencies

### Used by

 - [ir-booking-engine](..)

### Depends on

- [ir-checkout-skeleton](ir-checkout-skeleton)
- [ir-button](../../ui/ir-button)
- [ir-quick-auth](./ir-user-form/ir-quick-auth)
- [ir-user-form](ir-user-form)
- [ir-booking-details](ir-booking-details)
- [ir-pickup](ir-pickup)
- [ir-booking-summary](ir-booking-summary)

### Graph
```mermaid
graph TD;
  ir-checkout-page --> ir-checkout-skeleton
  ir-checkout-page --> ir-button
  ir-checkout-page --> ir-quick-auth
  ir-checkout-page --> ir-user-form
  ir-checkout-page --> ir-booking-details
  ir-checkout-page --> ir-pickup
  ir-checkout-page --> ir-booking-summary
  ir-button --> ir-icons
  ir-quick-auth --> ir-icons
  ir-quick-auth --> ir-button
  ir-user-form --> ir-input
  ir-user-form --> ir-phone-input
  ir-user-form --> ir-select
  ir-user-form --> ir-textarea
  ir-user-form --> ir-checkbox
  ir-phone-input --> ir-icons
  ir-booking-details --> ir-icons
  ir-booking-details --> ir-select
  ir-booking-details --> ir-button
  ir-booking-details --> ir-input
  ir-booking-details --> ir-dialog
  ir-dialog --> ir-button
  ir-pickup --> ir-icons
  ir-pickup --> ir-select
  ir-pickup --> ir-popover
  ir-pickup --> ir-calendar
  ir-pickup --> ir-input
  ir-popover --> ir-dialog
  ir-booking-summary --> ir-button
  ir-booking-summary --> ir-payment-view
  ir-booking-summary --> ir-checkbox
  ir-booking-summary --> ir-privacy-policy
  ir-payment-view --> ir-input
  ir-payment-view --> ir-credit-card-input
  ir-payment-view --> ir-select
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-booking-engine --> ir-checkout-page
  style ir-checkout-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
