# ir-roomtype



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute | Description | Type       | Default     |
| ---------- | --------- | ----------- | ---------- | ----------- |
| `roomtype` | --        |             | `RoomType` | `undefined` |


## Dependencies

### Used by

 - [ir-booking-page](..)

### Depends on

- [ir-property-gallery](../ir-property-gallery)
- [ir-accomodations](../ir-accomodations)
- [ir-rateplan](../ir-rateplan)

### Graph
```mermaid
graph TD;
  ir-roomtype --> ir-property-gallery
  ir-roomtype --> ir-accomodations
  ir-roomtype --> ir-rateplan
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
  ir-rateplan --> ir-select
  ir-rateplan --> ir-tooltip
  ir-booking-page --> ir-roomtype
  style ir-roomtype fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
