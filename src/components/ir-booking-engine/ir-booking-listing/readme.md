# ir-booking-listing



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description | Type      | Default     |
| ----------------- | ------------------- | ----------- | --------- | ----------- |
| `aName`           | `a-name`            |             | `string`  | `null`      |
| `baseUrl`         | `base-url`          |             | `string`  | `undefined` |
| `be`              | `be`                |             | `boolean` | `false`     |
| `footerShown`     | `footer-shown`      |             | `boolean` | `true`      |
| `headerShown`     | `header-shown`      |             | `boolean` | `true`      |
| `language`        | `language`          |             | `string`  | `undefined` |
| `maxPages`        | `max-pages`         |             | `number`  | `10`        |
| `perma_link`      | `perma_link`        |             | `string`  | `null`      |
| `propertyid`      | `propertyid`        |             | `number`  | `undefined` |
| `showAllBookings` | `show-all-bookings` |             | `boolean` | `true`      |


## Dependencies

### Used by

 - [ir-booking-engine](..)

### Depends on

- [ir-booking-details-view](ir-booking-details-view)
- [ir-booking-overview](ir-booking-overview)
- [ir-auth](../ir-nav/ir-auth)
- [ir-nav](../ir-nav)
- [ir-footer](../ir-footer)

### Graph
```mermaid
graph TD;
  ir-booking-listing --> ir-booking-details-view
  ir-booking-listing --> ir-booking-overview
  ir-booking-listing --> ir-auth
  ir-booking-listing --> ir-nav
  ir-booking-listing --> ir-footer
  ir-booking-details-view --> ir-button
  ir-booking-details-view --> ir-icons
  ir-booking-details-view --> ir-facilities
  ir-booking-details-view --> ir-booking-cancelation
  ir-button --> ir-icons
  ir-facilities --> ir-icons
  ir-booking-cancelation --> ir-alert-dialog
  ir-booking-cancelation --> ir-button
  ir-booking-overview --> ir-booking-header
  ir-booking-overview --> ir-badge
  ir-booking-overview --> ir-menu
  ir-booking-overview --> ir-button
  ir-booking-overview --> ir-pagination
  ir-booking-overview --> ir-booking-card
  ir-booking-overview --> ir-booking-cancelation
  ir-pagination --> ir-button
  ir-pagination --> ir-icons
  ir-booking-card --> ir-badge
  ir-booking-card --> ir-button
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-signin --> ir-button
  ir-badge-group --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
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
  ir-dialog --> ir-button
  ir-footer --> ir-button
  ir-footer --> ir-privacy-policy
  ir-footer --> ir-icons
  ir-footer --> ir-dialog
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-booking-engine --> ir-booking-listing
  style ir-booking-listing fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
