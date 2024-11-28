# ir-booking-details-view



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type      | Default |
| --------- | --------- | ----------- | --------- | ------- |
| `booking` | --        |             | `Booking` | `null`  |


## Events

| Event        | Description | Type                                                                        |
| ------------ | ----------- | --------------------------------------------------------------------------- |
| `bl_routing` |             | `CustomEvent<{ route: "booking" \| "booking-details"; params?: unknown; }>` |


## Dependencies

### Depends on

- [ir-button](../../../ui/ir-button)
- [ir-icons](../../../ui/ir-icons)
- [ir-facilities](../../ir-booking-page/ir-facilities)
- [ir-booking-cancellation](../../../ir-booking-cancellation)

### Graph
```mermaid
graph TD;
  ir-booking-details-view --> ir-button
  ir-booking-details-view --> ir-icons
  ir-booking-details-view --> ir-facilities
  ir-booking-details-view --> ir-booking-cancellation
  ir-button --> ir-icons
  ir-facilities --> ir-icons
  ir-booking-cancellation --> ir-alert-dialog
  ir-booking-cancellation --> ir-skeleton
  ir-booking-cancellation --> ir-icons
  ir-booking-cancellation --> ir-button
  style ir-booking-details-view fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
