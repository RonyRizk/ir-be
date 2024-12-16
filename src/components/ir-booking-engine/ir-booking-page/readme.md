# ir-booking-page



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type     | Default     |
| --------------- | ---------------- | ----------- | -------- | ----------- |
| `adultCount`    | `adult-count`    |             | `string` | `undefined` |
| `ages`          | `ages`           |             | `string` | `undefined` |
| `childrenCount` | `children-count` |             | `string` | `undefined` |
| `fromDate`      | `from-date`      |             | `string` | `undefined` |
| `toDate`        | `to-date`        |             | `string` | `undefined` |


## Events

| Event     | Description | Type                                                                                       |
| --------- | ----------- | ------------------------------------------------------------------------------------------ |
| `routing` |             | `CustomEvent<"booking" \| "booking-listing" \| "checkout" \| "invoice" \| "user-profile">` |


## Dependencies

### Used by

 - [ir-be](..)

### Depends on

- [ir-property-gallery](ir-property-gallery)
- [ir-availability-header](ir-availability-header)
- [ir-roomtype](ir-roomtype)
- [ir-facilities](ir-facilities)
- [ir-tooltip](../../ui/ir-tooltip)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-page --> ir-property-gallery
  ir-booking-page --> ir-availability-header
  ir-booking-page --> ir-roomtype
  ir-booking-page --> ir-facilities
  ir-booking-page --> ir-tooltip
  ir-booking-page --> ir-button
  ir-property-gallery --> ir-icons
  ir-property-gallery --> ir-gallery
  ir-property-gallery --> ir-carousel
  ir-property-gallery --> ir-dialog
  ir-property-gallery --> ir-button
  ir-property-gallery --> ir-room-type-amenities
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-room-type-amenities --> ir-icons
  ir-availability-header --> ir-date-popup
  ir-availability-header --> ir-adult-child-counter
  ir-availability-header --> ir-button
  ir-availability-header --> ir-coupon-dialog
  ir-availability-header --> ir-loyalty
  ir-date-popup --> ir-icons
  ir-date-popup --> ir-popover
  ir-date-popup --> ir-date-range
  ir-popover --> ir-dialog
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
  ir-roomtype --> ir-property-gallery
  ir-roomtype --> ir-accomodations
  ir-roomtype --> ir-rateplan
  ir-accomodations --> ir-icons
  ir-rateplan --> ir-tooltip
  ir-rateplan --> ir-skeleton
  ir-rateplan --> ir-select
  ir-rateplan --> ir-button
  ir-facilities --> ir-icons
  ir-be --> ir-booking-page
  style ir-booking-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
