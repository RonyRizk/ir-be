# ir-booking-cancelation



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute      | Description | Type                            | Default     |
| ----------------------- | -------------- | ----------- | ------------------------------- | ----------- |
| `booking`               | --             |             | `Booking`                       | `undefined` |
| `booking_nbr`           | `booking_nbr`  |             | `string`                        | `undefined` |
| `cancellation`          | `cancellation` |             | `string`                        | `undefined` |
| `cancellation_policies` | --             |             | `TBookingInfo[]`                | `[]`        |
| `currency`              | --             |             | `{ code: string; id: number; }` | `undefined` |
| `property_id`           | `property_id`  |             | `number`                        | `undefined` |


## Events

| Event                | Description | Type                                                                  |
| -------------------- | ----------- | --------------------------------------------------------------------- |
| `cancellationResult` |             | `CustomEvent<{ state: "success" \| "failed"; booking_nbr: string; }>` |
| `openChange`         |             | `CustomEvent<boolean>`                                                |


## Methods

### `openDialog() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-booking-details-view](../ir-booking-engine/ir-booking-listing/ir-booking-details-view)
 - [ir-booking-overview](../ir-booking-engine/ir-booking-listing/ir-booking-overview)
 - [ir-invoice](../ir-invoice)

### Depends on

- [ir-alert-dialog](../ui/ir-alert-dialog)
- [ir-skeleton](../ui/ir-skeleton)
- [ir-icons](../ui/ir-icons)
- [ir-button](../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-cancellation --> ir-alert-dialog
  ir-booking-cancellation --> ir-skeleton
  ir-booking-cancellation --> ir-icons
  ir-booking-cancellation --> ir-button
  ir-button --> ir-icons
  ir-booking-details-view --> ir-booking-cancellation
  ir-booking-overview --> ir-booking-cancellation
  ir-invoice --> ir-booking-cancellation
  style ir-booking-cancellation fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
