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
  ir-availibility-header --> ir-date-popup
  ir-availibility-header --> ir-adult-child-counter
  ir-availibility-header --> ir-button
  ir-availibility-header --> ir-coupon-dialog
  ir-availibility-header --> ir-loyalty
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
  ir-booking-page --> ir-availibility-header
  style ir-availibility-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
