# ir-user-form



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                         | Default     |
| -------- | --------- | ----------- | ---------------------------- | ----------- |
| `errors` | --        |             | `{ [x: string]: ZodIssue; }` | `undefined` |


## Events

| Event               | Description | Type                             |
| ------------------- | ----------- | -------------------------------- |
| `changePageLoading` |             | `CustomEvent<"add" \| "remove">` |


## Dependencies

### Used by

 - [ir-checkout-page](..)

### Depends on

- [ir-input](../../../ui/ir-input)
- [ir-phone-input](../../../ui/ir-phone-input)
- [ir-select](../../../ui/ir-select)
- [ir-textarea](../../../ui/ir-textarea)
- [ir-checkbox](../../../ui/ir-checkbox)

### Graph
```mermaid
graph TD;
  ir-user-form --> ir-input
  ir-user-form --> ir-phone-input
  ir-user-form --> ir-select
  ir-user-form --> ir-textarea
  ir-user-form --> ir-checkbox
  ir-phone-input --> ir-icons
  ir-checkout-page --> ir-user-form
  style ir-user-form fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
