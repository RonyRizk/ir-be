# ir-dropdown



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description | Type       | Default         |
| ---------- | ----------- | ----------- | ---------- | --------------- |
| `data`     | --          |             | `IItems[]` | `[]`            |
| `menuItem` | `menu-item` |             | `string`   | `'Toggle Menu'` |


## Events

| Event           | Description | Type                            |
| --------------- | ----------- | ------------------------------- |
| `menuItemClick` |             | `CustomEvent<number \| string>` |


## Dependencies

### Used by

 - [ir-booking-overview](../../ir-booking-engine/ir-booking-listing/ir-booking-overview)
 - [ir-nav](../../ir-booking-engine/ir-nav)

### Graph
```mermaid
graph TD;
  ir-booking-overview --> ir-menu
  ir-nav --> ir-menu
  style ir-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
