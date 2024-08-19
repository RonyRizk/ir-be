# ir-interceptor



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description | Type    | Default |
| ------------------ | --------- | ----------- | ------- | ------- |
| `handledEndpoints` | --        |             | `any[]` | `[]`    |


## Dependencies

### Used by

 - [ir-be](../ir-booking-engine)
 - [ir-booking-listing](../ir-booking-engine/ir-booking-listing)
 - [ir-invoice](../ir-invoice)

### Depends on

- [ir-alert-dialog](../ui/ir-alert-dialog)
- [ir-icons](../ui/ir-icons)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-interceptor --> ir-alert-dialog
  ir-interceptor --> ir-icons
  ir-interceptor --> ir-button
  ir-button --> ir-icons
  ir-be --> ir-interceptor
  ir-booking-listing --> ir-interceptor
  ir-invoice --> ir-interceptor
  style ir-interceptor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
