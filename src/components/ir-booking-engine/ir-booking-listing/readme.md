# ir-booking-listing



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute             | Description | Type                                                            | Default                                 |
| ------------------ | --------------------- | ----------- | --------------------------------------------------------------- | --------------------------------------- |
| `aName`            | `a-name`              |             | `string`                                                        | `null`                                  |
| `aff`              | `aff`                 |             | `string`                                                        | `null`                                  |
| `baseUrl`          | `base-url`            |             | `string`                                                        | `'https://gateway.igloorooms.com/IRBE'` |
| `be`               | `be`                  |             | `boolean`                                                       | `false`                                 |
| `footerShown`      | `footer-shown`        |             | `boolean`                                                       | `true`                                  |
| `headerShown`      | `header-shown`        |             | `boolean`                                                       | `true`                                  |
| `hideGoogleSignIn` | `hide-google-sign-in` |             | `boolean`                                                       | `true`                                  |
| `language`         | `language`            |             | `string`                                                        | `undefined`                             |
| `maxPages`         | `max-pages`           |             | `number`                                                        | `10`                                    |
| `perma_link`       | `perma_link`          |             | `string`                                                        | `null`                                  |
| `propertyid`       | `propertyid`          |             | `number`                                                        | `undefined`                             |
| `showAllBookings`  | `show-all-bookings`   |             | `boolean`                                                       | `true`                                  |
| `startScreen`      | --                    |             | `{ screen: "booking-details" \| "bookings"; params: unknown; }` | `{ screen: 'bookings', params: null }`  |
| `version`          | `version`             |             | `string`                                                        | `'2.0'`                                 |


## Dependencies

### Used by

 - [ir-be](..)

### Depends on

- [ir-booking-overview](ir-booking-overview)
- [ir-button](../../ui/ir-button)
- [ir-invoice](../../ir-invoice)
- [ir-user-profile](../ir-nav/ir-user-profile)
- [ir-skeleton](../../ui/ir-skeleton)
- [ir-auth](../ir-nav/ir-auth)
- [ir-interceptor](../../ir-interceptor)
- [ir-nav](../ir-nav)
- [ir-footer](../ir-footer)
- [ir-privacy-policy](../ir-privacy-policy)

### Graph
```mermaid
graph TD;
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
  ir-button --> ir-icons
  ir-booking-card --> ir-badge
  ir-booking-card --> ir-button
  ir-booking-cancellation --> ir-alert-dialog
  ir-booking-cancellation --> ir-skeleton
  ir-booking-cancellation --> ir-icons
  ir-booking-cancellation --> ir-button
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
  ir-phone-input --> ir-icons
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
  ir-dialog --> ir-button
  ir-footer --> ir-button
  ir-footer --> ir-icons
  ir-footer --> ir-dialog
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-be --> ir-booking-listing
  style ir-booking-listing fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
