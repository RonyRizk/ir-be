# ir-roomtype



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute | Description | Type                  | Default     |
| ---------- | --------- | ----------- | --------------------- | ----------- |
| `display`  | `display` |             | `"default" \| "grid"` | `'default'` |
| `roomtype` | --        |             | `RoomType`            | `undefined` |


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
  ir-property-gallery --> ir-carousel
  ir-property-gallery --> ir-dialog
  ir-property-gallery --> ir-button
  ir-property-gallery --> ir-room-type-amenities
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-room-type-amenities --> ir-icons
  ir-accomodations --> ir-icons
  ir-rateplan --> ir-tooltip
  ir-rateplan --> ir-skeleton
  ir-rateplan --> ir-select
  ir-rateplan --> ir-button
  ir-booking-page --> ir-roomtype
  style ir-roomtype fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
