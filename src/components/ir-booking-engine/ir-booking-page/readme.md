# ir-booking-page



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type     | Default     |
| --------------- | ---------------- | ----------- | -------- | ----------- |
| `adultCount`    | `adult-count`    |             | `string` | `undefined` |
| `childrenCount` | `children-count` |             | `string` | `undefined` |
| `fromDate`      | `from-date`      |             | `string` | `undefined` |
| `toDate`        | `to-date`        |             | `string` | `undefined` |


## Events

| Event     | Description | Type                                                                     |
| --------- | ----------- | ------------------------------------------------------------------------ |
| `routing` |             | `CustomEvent<"booking" \| "booking-listing" \| "checkout" \| "invoice">` |


## Dependencies

### Used by

 - [ir-booking-engine](..)

### Depends on

- [ir-property-gallery](ir-property-gallery)
- [ir-availibility-header](ir-availibility-header)
- [ir-roomtype](ir-roomtype)
- [ir-facilities](ir-facilities)
- [ir-button](../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-page --> ir-property-gallery
  ir-booking-page --> ir-availibility-header
  ir-booking-page --> ir-roomtype
  ir-booking-page --> ir-facilities
  ir-booking-page --> ir-button
  ir-property-gallery --> ir-icons
  ir-property-gallery --> ir-gallery
  ir-property-gallery --> ir-accomodations
  ir-property-gallery --> ir-carousel
  ir-property-gallery --> ir-button
  ir-property-gallery --> ir-dialog
  ir-property-gallery --> ir-room-type-amenities
  ir-accomodations --> ir-icons
  ir-button --> ir-icons
  ir-dialog --> ir-button
  ir-room-type-amenities --> ir-icons
  ir-availibility-header --> ir-date-popup
  ir-availibility-header --> ir-adult-child-counter
  ir-availibility-header --> ir-button
  ir-availibility-header --> ir-coupon-dialog
  ir-availibility-header --> ir-loyalty
  ir-date-popup --> ir-icons
  ir-date-popup --> ir-popover
  ir-date-popup --> ir-date-range
  ir-popover --> ir-dialog
  ir-adult-child-counter --> ir-icons
  ir-adult-child-counter --> ir-popover
  ir-adult-child-counter --> ir-button
  ir-coupon-dialog --> ir-button
  ir-coupon-dialog --> ir-icons
  ir-coupon-dialog --> ir-dialog
  ir-coupon-dialog --> ir-input
  ir-loyalty --> ir-button
  ir-loyalty --> ir-icons
  ir-roomtype --> ir-property-gallery
  ir-roomtype --> ir-accomodations
  ir-roomtype --> ir-rateplan
  ir-rateplan --> ir-select
  ir-rateplan --> ir-tooltip
  ir-facilities --> ir-icons
  ir-booking-engine --> ir-booking-page
  style ir-booking-page fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
