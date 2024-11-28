# ir-booking-overview



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description | Type      | Default     |
| ----------------- | ------------------- | ----------- | --------- | ----------- |
| `aff`             | `aff`               |             | `boolean` | `false`     |
| `be`              | `be`                |             | `boolean` | `false`     |
| `language`        | `language`          |             | `string`  | `undefined` |
| `maxPages`        | `max-pages`         |             | `number`  | `10`        |
| `propertyid`      | `propertyid`        |             | `number`  | `undefined` |
| `showAllBookings` | `show-all-bookings` |             | `boolean` | `true`      |


## Events

| Event        | Description | Type                                                                        |
| ------------ | ----------- | --------------------------------------------------------------------------- |
| `bl_routing` |             | `CustomEvent<{ route: "booking" \| "booking-details"; params?: unknown; }>` |


## Dependencies

### Used by

 - [ir-booking-listing](..)

### Depends on

- [ir-skeleton](../../../ui/ir-skeleton)
- [ir-booking-header](../ir-booking-header)
- [ir-badge](../../../ui/ir-badge)
- [ir-menu](../../../ui/ir-menu)
- [ir-pagination](../ir-pagination)
- [ir-booking-card](../ir-booking-card)
- [ir-booking-cancellation](../../../ir-booking-cancellation)

### Graph
```mermaid
graph TD;
  ir-booking-overview --> ir-skeleton
  ir-booking-overview --> ir-booking-header
  ir-booking-overview --> ir-badge
  ir-booking-overview --> ir-menu
  ir-booking-overview --> ir-pagination
  ir-booking-overview --> ir-booking-card
  ir-booking-overview --> ir-booking-cancellation
  ir-pagination --> ir-button
  ir-pagination --> ir-icons
  ir-button --> ir-icons
  ir-booking-card --> ir-badge
  ir-booking-card --> ir-button
  ir-booking-cancellation --> ir-alert-dialog
  ir-booking-cancellation --> ir-skeleton
  ir-booking-cancellation --> ir-icons
  ir-booking-cancellation --> ir-button
  ir-booking-listing --> ir-booking-overview
  style ir-booking-overview fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
