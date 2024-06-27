# ir-rateplan



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description | Type                                                                                              | Default     |
| ------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------- | ----------- |
| `ratePlan`          | --                    |             | `RatePlan`                                                                                        | `undefined` |
| `roomTypeId`        | `room-type-id`        |             | `number`                                                                                          | `undefined` |
| `roomTypeInventory` | `room-type-inventory` |             | `number`                                                                                          | `undefined` |
| `visibleInventory`  | --                    |             | `IRatePlanSelection \| { reserved: number; visibleInventory?: number; selected_variation: any; }` | `undefined` |


## Events

| Event                  | Description | Type                |
| ---------------------- | ----------- | ------------------- |
| `animateBookingButton` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-roomtype](../ir-roomtype)

### Depends on

- [ir-select](../../../ui/ir-select)
- [ir-tooltip](../../../ui/ir-tooltip)

### Graph
```mermaid
graph TD;
  ir-rateplan --> ir-select
  ir-rateplan --> ir-tooltip
  ir-roomtype --> ir-rateplan
  style ir-rateplan fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
