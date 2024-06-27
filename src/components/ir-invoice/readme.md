# ir-invoice



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type     | Default     |
| ------------ | ------------- | ----------- | -------- | ----------- |
| `aName`      | `a-name`      |             | `string` | `null`      |
| `baseUrl`    | `base-url`    |             | `string` | `undefined` |
| `bookingNbr` | `booking-nbr` |             | `string` | `undefined` |
| `email`      | `email`       |             | `string` | `undefined` |
| `language`   | `language`    |             | `string` | `'en'`      |
| `perma_link` | `perma_link`  |             | `string` | `null`      |
| `propertyId` | `property-id` |             | `number` | `undefined` |
| `status`     | `status`      |             | `0 \| 1` | `1`         |


## Dependencies

### Used by

 - [ir-booking-engine](../ir-booking-engine)

### Depends on

- [ir-interceptor](../ir-interceptor)
- [ir-nav](../ir-booking-engine/ir-nav)
- [ir-button](../ui/ir-button)
- [ir-icons](../ui/ir-icons)
- [ir-footer](../ir-booking-engine/ir-footer)
- [ir-alert-dialog](../ui/ir-alert-dialog)

### Graph
```mermaid
graph TD;
  ir-invoice --> ir-interceptor
  ir-invoice --> ir-nav
  ir-invoice --> ir-button
  ir-invoice --> ir-icons
  ir-invoice --> ir-footer
  ir-invoice --> ir-alert-dialog
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
  ir-button --> ir-icons
  ir-booking-code --> ir-input
  ir-booking-code --> ir-button
  ir-user-avatar --> ir-icons
  ir-sheet --> ir-button
  ir-modal --> ir-auth
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-signin --> ir-button
  ir-badge-group --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-dialog --> ir-button
  ir-footer --> ir-button
  ir-footer --> ir-privacy-policy
  ir-footer --> ir-icons
  ir-footer --> ir-dialog
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-booking-engine --> ir-invoice
  style ir-invoice fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
