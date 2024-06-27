# ir-property-gallery



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                      | Default     |
| ---------------- | ---------------- | ----------- | ------------------------- | ----------- |
| `property_state` | `property_state` |             | `"carousel" \| "gallery"` | `'gallery'` |
| `roomType`       | --               |             | `RoomType`                | `undefined` |


## Dependencies

### Used by

 - [ir-booking-page](..)
 - [ir-roomtype](../ir-roomtype)

### Depends on

- [ir-icons](../../../ui/ir-icons)
- [ir-gallery](../../../ui/ir-gallery)
- [ir-accomodations](../ir-accomodations)
- [ir-carousel](../../../ui/ir-carousel)
- [ir-button](../../../ui/ir-button)
- [ir-dialog](../../../ui/ir-dialog)
- [ir-room-type-amenities](../ir-room-type-amenities)

### Graph
```mermaid
graph TD;
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
  ir-booking-page --> ir-property-gallery
  ir-roomtype --> ir-property-gallery
  style ir-property-gallery fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
