# ir-booking-engine



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute             | Description | Type                                     | Default     |
| ------------------ | --------------------- | ----------- | ---------------------------------------- | ----------- |
| `adults`           | `adults`              |             | `string`                                 | `'2'`       |
| `aff`              | `aff`                 |             | `string`                                 | `undefined` |
| `agent_code`       | `agent_code`          |             | `string`                                 | `undefined` |
| `ages`             | `ages`                |             | `string`                                 | `undefined` |
| `checkin`          | `checkin`             |             | `string`                                 | `undefined` |
| `checkout`         | `checkout`            |             | `string`                                 | `undefined` |
| `child`            | `child`               |             | `string`                                 | `undefined` |
| `coupon`           | `coupon`              |             | `string`                                 | `undefined` |
| `cur`              | `cur`                 |             | `string`                                 | `undefined` |
| `hideGoogleSignIn` | `hide-google-sign-in` |             | `boolean`                                | `true`      |
| `injected`         | `injected`            |             | `boolean`                                | `undefined` |
| `language`         | `language`            |             | `string`                                 | `undefined` |
| `loyalty`          | `loyalty`             |             | `boolean`                                | `undefined` |
| `origin`           | `origin`              |             | `string`                                 | `null`      |
| `p`                | `p`                   |             | `string`                                 | `null`      |
| `perma_link`       | `perma_link`          |             | `string`                                 | `null`      |
| `property`         | --                    |             | `IExposedProperty`                       | `null`      |
| `propertyId`       | `property-id`         |             | `number`                                 | `undefined` |
| `rp_id`            | `rp_id`               |             | `number`                                 | `null`      |
| `rt_id`            | `rt_id`               |             | `number`                                 | `null`      |
| `source`           | --                    |             | `{ code: string; description: string; }` | `null`      |
| `stag`             | `stag`                |             | `string`                                 | `undefined` |


## Dependencies

### Depends on

- [ir-booking-page](ir-booking-page)
- [ir-checkout-page](ir-checkout-page)
- [ir-invoice](../ir-invoice)
- [ir-booking-listing](ir-booking-listing)
- [ir-user-profile](./ir-nav/ir-user-profile)
- [ir-home-loader](../ir-home-loader)
- [ir-interceptor](../ir-interceptor)
- [ir-nav](ir-nav)
- [ir-privacy-policy](ir-privacy-policy)
- [ir-footer](ir-footer)

### Graph
```mermaid
graph TD;
  ir-be --> ir-booking-page
  ir-be --> ir-checkout-page
  ir-be --> ir-invoice
  ir-be --> ir-booking-listing
  ir-be --> ir-user-profile
  ir-be --> ir-home-loader
  ir-be --> ir-interceptor
  ir-be --> ir-nav
  ir-be --> ir-privacy-policy
  ir-be --> ir-footer
  ir-booking-page --> ir-property-gallery
  ir-booking-page --> ir-availability-header
  ir-booking-page --> ir-roomtype
  ir-booking-page --> ir-facilities
  ir-booking-page --> ir-tooltip
  ir-booking-page --> ir-button
  ir-property-gallery --> ir-icons
  ir-property-gallery --> ir-gallery
  ir-property-gallery --> ir-carousel
  ir-property-gallery --> ir-dialog
  ir-property-gallery --> ir-button
  ir-property-gallery --> ir-room-type-amenities
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-room-type-amenities --> ir-icons
  ir-availability-header --> ir-date-popup
  ir-availability-header --> ir-adult-child-counter
  ir-availability-header --> ir-button
  ir-availability-header --> ir-coupon-dialog
  ir-availability-header --> ir-loyalty
  ir-date-popup --> ir-icons
  ir-date-popup --> ir-popover
  ir-date-popup --> ir-date-range
  ir-popover --> ir-dialog
  ir-adult-child-counter --> ir-icons
  ir-adult-child-counter --> ir-popover
  ir-adult-child-counter --> ir-button
  ir-adult-child-counter --> ir-select
  ir-coupon-dialog --> ir-button
  ir-coupon-dialog --> ir-icons
  ir-coupon-dialog --> ir-dialog
  ir-coupon-dialog --> ir-input
  ir-loyalty --> ir-button
  ir-loyalty --> ir-icons
  ir-roomtype --> ir-property-gallery
  ir-roomtype --> ir-accomodations
  ir-roomtype --> ir-rateplan
  ir-accomodations --> ir-icons
  ir-rateplan --> ir-tooltip
  ir-rateplan --> ir-skeleton
  ir-rateplan --> ir-select
  ir-rateplan --> ir-button
  ir-facilities --> ir-icons
  ir-checkout-page --> ir-checkout-skeleton
  ir-checkout-page --> ir-button
  ir-checkout-page --> ir-quick-auth
  ir-checkout-page --> ir-user-form
  ir-checkout-page --> ir-booking-details
  ir-checkout-page --> ir-pickup
  ir-checkout-page --> ir-booking-summary
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
  ir-pickup --> ir-icons
  ir-pickup --> ir-select
  ir-pickup --> ir-popover
  ir-pickup --> ir-calendar
  ir-pickup --> ir-input
  ir-booking-summary --> ir-button
  ir-booking-summary --> ir-payment-view
  ir-booking-summary --> ir-checkbox
  ir-payment-view --> ir-input
  ir-payment-view --> ir-credit-card-input
  ir-payment-view --> ir-select
  ir-invoice --> ir-interceptor
  ir-invoice --> ir-nav
  ir-invoice --> ir-icons
  ir-invoice --> ir-button
  ir-invoice --> ir-footer
  ir-invoice --> ir-privacy-policy
  ir-invoice --> ir-booking-cancellation
  ir-invoice --> ir-skeleton
  ir-interceptor --> ir-alert-dialog
  ir-interceptor --> ir-icons
  ir-interceptor --> ir-button
  ir-nav --> ir-language-picker
  ir-nav --> ir-booking-code
  ir-nav --> ir-google-maps
  ir-nav --> ir-user-profile
  ir-nav --> ir-button
  ir-nav --> ir-menu
  ir-nav --> ir-user-avatar
  ir-nav --> ir-icons
  ir-nav --> ir-sheet
  ir-nav --> ir-modal
  ir-nav --> ir-dialog
  ir-language-picker --> ir-select
  ir-language-picker --> ir-button
  ir-booking-code --> ir-input
  ir-booking-code --> ir-button
  ir-user-profile --> ir-input
  ir-user-profile --> ir-select
  ir-user-profile --> ir-phone-input
  ir-user-profile --> ir-checkbox
  ir-user-profile --> ir-button
  ir-user-avatar --> ir-icons
  ir-sheet --> ir-button
  ir-modal --> ir-auth
  ir-modal --> ir-dialog
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-badge-group --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-footer --> ir-button
  ir-footer --> ir-icons
  ir-footer --> ir-dialog
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-booking-cancellation --> ir-alert-dialog
  ir-booking-cancellation --> ir-skeleton
  ir-booking-cancellation --> ir-icons
  ir-booking-cancellation --> ir-button
  ir-booking-listing --> ir-booking-overview
  ir-booking-listing --> ir-button
  ir-booking-listing --> ir-invoice
  ir-booking-listing --> ir-user-profile
  ir-booking-listing --> ir-skeleton
  ir-booking-listing --> ir-auth
  ir-booking-listing --> ir-interceptor
  ir-booking-listing --> ir-nav
  ir-booking-listing --> ir-footer
  ir-booking-listing --> ir-privacy-policy
  ir-booking-overview --> ir-skeleton
  ir-booking-overview --> ir-booking-header
  ir-booking-overview --> ir-badge
  ir-booking-overview --> ir-menu
  ir-booking-overview --> ir-pagination
  ir-booking-overview --> ir-booking-card
  ir-booking-overview --> ir-booking-cancellation
  ir-pagination --> ir-button
  ir-pagination --> ir-icons
  ir-booking-card --> ir-badge
  ir-booking-card --> ir-button
  ir-home-loader --> ir-skeleton
  style ir-be fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
