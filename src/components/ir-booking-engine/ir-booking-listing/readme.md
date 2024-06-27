# ir-booking-listing



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type      | Default     |
| ------------- | -------------- | ----------- | --------- | ----------- |
| `aName`       | `a-name`       |             | `string`  | `null`      |
| `baseUrl`     | `base-url`     |             | `string`  | `undefined` |
| `footerShown` | `footer-shown` |             | `boolean` | `true`      |
| `headerShown` | `header-shown` |             | `boolean` | `true`      |
| `language`    | `language`     |             | `string`  | `undefined` |
| `maxPages`    | `max-pages`    |             | `number`  | `10`        |
| `perma_link`  | `perma_link`   |             | `string`  | `null`      |
| `propertyid`  | `propertyid`   |             | `number`  | `undefined` |


## Dependencies

### Used by

 - [ir-booking-engine](..)

### Depends on

- [ir-auth](../ir-nav/ir-auth)
- [ir-nav](../ir-nav)
- [ir-booking-header](ir-booking-header)
- [ir-badge](../../ui/ir-badge)
- [ir-button](../../ui/ir-button)
- [ir-pagination](ir-pagination)
- [ir-booking-card](ir-booking-card)
- [ir-footer](../ir-footer)

### Graph
```mermaid
graph TD;
  ir-booking-listing --> ir-auth
  ir-booking-listing --> ir-nav
  ir-booking-listing --> ir-booking-header
  ir-booking-listing --> ir-badge
  ir-booking-listing --> ir-button
  ir-booking-listing --> ir-pagination
  ir-booking-listing --> ir-booking-card
  ir-booking-listing --> ir-footer
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-signin --> ir-button
  ir-badge-group --> ir-icons
  ir-button --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-nav --> ir-language-picker
  ir-nav --> ir-booking-code
  ir-nav --> ir-google-maps
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
  ir-user-avatar --> ir-icons
  ir-sheet --> ir-button
  ir-modal --> ir-auth
  ir-dialog --> ir-button
  ir-pagination --> ir-button
  ir-pagination --> ir-icons
  ir-booking-card --> ir-badge
  ir-booking-card --> ir-button
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
