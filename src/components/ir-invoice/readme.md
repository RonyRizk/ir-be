# ir-invoice



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description | Type      | Default                                 |
| -------------------- | ---------------------- | ----------- | --------- | --------------------------------------- |
| `aName`              | `a-name`               |             | `string`  | `null`                                  |
| `baseUrl`            | `base-url`             |             | `string`  | `'https://gateway.igloorooms.com/IRBE'` |
| `be`                 | `be`                   |             | `boolean` | `false`                                 |
| `bookingNbr`         | `booking-nbr`          |             | `string`  | `undefined`                             |
| `email`              | `email`                |             | `string`  | `undefined`                             |
| `footerShown`        | `footer-shown`         |             | `boolean` | `true`                                  |
| `headerMessageShown` | `header-message-shown` |             | `boolean` | `true`                                  |
| `headerShown`        | `header-shown`         |             | `boolean` | `true`                                  |
| `isConfermation`     | `is-confermation`      |             | `boolean` | `true`                                  |
| `language`           | `language`             |             | `string`  | `undefined`                             |
| `locationShown`      | `location-shown`       |             | `boolean` | `true`                                  |
| `perma_link`         | `perma_link`           |             | `string`  | `null`                                  |
| `propertyId`         | `property-id`          |             | `number`  | `undefined`                             |
| `status`             | `status`               |             | `0 \| 1`  | `1`                                     |
| `version`            | `version`              |             | `string`  | `'2.0'`                                 |


## Dependencies

### Used by

 - [ir-be](../ir-booking-engine)
 - [ir-booking-listing](../ir-booking-engine/ir-booking-listing)

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-nav](../ir-booking-engine/ir-nav)
- [ir-icons](../ui/ir-icons)
- [ir-button](../ui/ir-button)
- [ir-footer](../ir-booking-engine/ir-footer)
- [ir-privacy-policy](../ir-booking-engine/ir-privacy-policy)
- [ir-booking-cancellation](../ir-booking-cancellation)
- [ir-skeleton](../ui/ir-skeleton)

### Graph
```mermaid
graph TD;
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
  ir-button --> ir-icons
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
  ir-booking-cancellation --> ir-alert-dialog
  ir-booking-cancellation --> ir-skeleton
  ir-booking-cancellation --> ir-icons
  ir-booking-cancellation --> ir-button
  ir-be --> ir-invoice
  ir-booking-listing --> ir-invoice
  style ir-invoice fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
