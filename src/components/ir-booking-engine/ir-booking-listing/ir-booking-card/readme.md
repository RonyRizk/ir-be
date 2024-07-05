# ir-booking-card



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default     |
| --------- | --------- | ----------- | --------- | ----------- |
| `aff`     | `aff`     |             | `boolean` | `false`     |
| `booking` | --        |             | `Booking` | `undefined` |


## Events

| Event           | Description | Type                                        |
| --------------- | ----------- | ------------------------------------------- |
| `optionClicked` |             | `CustomEvent<{ tag: string; id: number; }>` |


## Dependencies

### Used by

 - [ir-booking-overview](../ir-booking-overview)

### Depends on

- [ir-badge](../../../ui/ir-badge)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-card --> ir-badge
  ir-booking-card --> ir-button
  ir-button --> ir-icons
  ir-booking-overview --> ir-booking-card
  style ir-booking-card fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
