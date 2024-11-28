# ir-availibility-header



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type     | Default     |
| --------------- | ---------------- | ----------- | -------- | ----------- |
| `adultCount`    | `adult-count`    |             | `string` | `undefined` |
| `ages`          | `ages`           |             | `string` | `''`        |
| `childrenCount` | `children-count` |             | `string` | `undefined` |
| `fromDate`      | `from-date`      |             | `string` | `undefined` |
| `toDate`        | `to-date`        |             | `string` | `undefined` |


## Events

| Event              | Description | Type                |
| ------------------ | ----------- | ------------------- |
| `resetBooking`     |             | `CustomEvent<null>` |
| `scrollToRoomType` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-page](..)

### Depends on

- [ir-date-popup](ir-date-popup)
- [ir-adult-child-counter](../ir-adult-child-counter)
- [ir-button](../../../ui/ir-button)
- [ir-coupon-dialog](ir-coupon-dialog)
- [ir-loyalty](ir-loyalty)

### Graph
```mermaid
graph TD;
  ir-availability-header --> ir-date-popup
  ir-availability-header --> ir-adult-child-counter
  ir-availability-header --> ir-button
  ir-availability-header --> ir-coupon-dialog
  ir-availability-header --> ir-loyalty
  ir-date-popup --> ir-icons
  ir-date-popup --> ir-popover
  ir-date-popup --> ir-date-range
  ir-popover --> ir-dialog
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-adult-child-counter --> ir-icons
  ir-adult-child-counter --> ir-popover
  ir-adult-child-counter --> ir-button
  ir-adult-child-counter --> ir-select
  ir-coupon-dialog --> ir-button
  ir-coupon-dialog --> ir-icons
  ir-coupon-dialog --> ir-dialog
  ir-coupon-dialog --> ir-input
  ir-loyalty --> ir-button
  ir-loyalty --> ir-icons
  ir-booking-page --> ir-availability-header
  style ir-availability-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
