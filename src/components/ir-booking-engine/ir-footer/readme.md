# ir-footer



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type     | Default     |
| --------- | --------- | ----------- | -------- | ----------- |
| `version` | `version` |             | `string` | `undefined` |


## Events

| Event               | Description | Type                |
| ------------------- | ----------- | ------------------- |
| `openPrivacyPolicy` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-be](..)
 - [ir-booking-listing](../ir-booking-listing)
 - [ir-invoice](../../ir-invoice)

### Depends on

- [ir-button](../../ui/ir-button)
- [ir-icons](../../ui/ir-icons)
- [ir-dialog](../../ui/ir-dialog)

### Graph
```mermaid
graph TD;
  ir-footer --> ir-button
  ir-footer --> ir-icons
  ir-footer --> ir-dialog
  ir-button --> ir-icons
  ir-dialog --> ir-button
  ir-be --> ir-footer
  ir-booking-listing --> ir-footer
  ir-invoice --> ir-footer
  style ir-footer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
