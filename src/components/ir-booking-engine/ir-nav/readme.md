# ir-nav



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type                  | Default     |
| ------------------ | -------------------- | ----------- | --------------------- | ----------- |
| `currencies`       | --                   |             | `ICurrency[]`         | `undefined` |
| `isBookingListing` | `is-booking-listing` |             | `boolean`             | `false`     |
| `languages`        | --                   |             | `IExposedLanguages[]` | `undefined` |
| `logo`             | `logo`               |             | `string`              | `undefined` |
| `menuShown`        | `menu-shown`         |             | `boolean`             | `true`      |
| `showBookingCode`  | `show-booking-code`  |             | `boolean`             | `true`      |
| `showCurrency`     | `show-currency`      |             | `boolean`             | `true`      |
| `website`          | `website`            |             | `string`              | `undefined` |


## Events

| Event     | Description | Type                                                                                       |
| --------- | ----------- | ------------------------------------------------------------------------------------------ |
| `routing` |             | `CustomEvent<"booking" \| "booking-listing" \| "checkout" \| "invoice" \| "user-profile">` |


## Dependencies

### Used by

 - [ir-booking-engine](..)
 - [ir-booking-listing](../ir-booking-listing)
 - [ir-invoice](../../ir-invoice)

### Depends on

- [ir-language-picker](ir-language-picker)
- [ir-booking-code](../ir-booking-page/ir-booking-code)
- [ir-google-maps](../../ir-google-maps)
- [ir-user-profile](ir-user-profile)
- [ir-button](../../ui/ir-button)
- [ir-menu](../../ui/ir-menu)
- [ir-user-avatar](./ir-user-profile/ir-user-avatar)
- [ir-icons](../../ui/ir-icons)
- [ir-sheet](../../ui/ir-sheet)
- [ir-modal](../../ui/ir-modal)
- [ir-dialog](../../ui/ir-dialog)

### Graph
```mermaid
graph TD;
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
  ir-button --> ir-icons
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
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-badge-group --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-dialog --> ir-button
  ir-booking-engine --> ir-nav
  ir-booking-listing --> ir-nav
  ir-invoice --> ir-nav
  style ir-nav fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
