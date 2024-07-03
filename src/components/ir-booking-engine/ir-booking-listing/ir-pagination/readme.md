# ir-pagination



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description | Type     | Default     |
| -------------- | ---------------- | ----------- | -------- | ----------- |
| `current`      | `current`        |             | `number` | `undefined` |
| `minPageShown` | `min-page-shown` |             | `number` | `7`         |
| `total`        | `total`          |             | `number` | `undefined` |


## Events

| Event        | Description | Type                  |
| ------------ | ----------- | --------------------- |
| `pageChange` |             | `CustomEvent<number>` |


## Dependencies

### Used by

 - [ir-booking-overview](../ir-booking-overview)

### Depends on

- [ir-button](../../../ui/ir-button)
- [ir-icons](../../../ui/ir-icons)

### Graph
```mermaid
graph TD;
  ir-pagination --> ir-button
  ir-pagination --> ir-icons
  ir-button --> ir-icons
  ir-booking-overview --> ir-pagination
  style ir-pagination fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
