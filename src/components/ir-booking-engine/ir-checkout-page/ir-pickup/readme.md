# ir-pickup



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                         | Default     |
| -------- | --------- | ----------- | ---------------------------- | ----------- |
| `errors` | --        |             | `{ [x: string]: ZodIssue; }` | `undefined` |


## Dependencies

### Used by

 - [ir-checkout-page](..)

### Depends on

- [ir-icons](../../../ui/ir-icons)
- [ir-select](../../../ui/ir-select)
- [ir-popover](../../../ui/ir-popover)
- [ir-calendar](../../../ui/ir-calendar)
- [ir-input](../../../ui/ir-input)

### Graph
```mermaid
graph TD;
  ir-pickup --> ir-icons
  ir-pickup --> ir-select
  ir-pickup --> ir-popover
  ir-pickup --> ir-calendar
  ir-pickup --> ir-input
  ir-popover --> ir-dialog
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-checkout-page --> ir-pickup
  style ir-pickup fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
