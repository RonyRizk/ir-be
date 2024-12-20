# ir-property-gallery



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type                      | Default     |
| ---------------- | ---------------- | ----------- | ------------------------- | ----------- |
| `display`        | `display`        |             | `"default" \| "grid"`     | `'default'` |
| `property_state` | `property_state` |             | `"carousel" \| "gallery"` | `'gallery'` |
| `roomType`       | --               |             | `RoomType`                | `undefined` |


## Dependencies

### Used by

 - [ir-booking-page](..)
 - [ir-roomtype](../ir-roomtype)

### Depends on

- [ir-icons](../../../ui/ir-icons)
- [ir-carousel](../../../ui/ir-carousel)
- [ir-gallery](../../../ui/ir-gallery)
- [ir-dialog](../../../ui/ir-dialog)
- [ir-button](../../../ui/ir-button)
- [ir-room-type-amenities](../ir-room-type-amenities)

### Graph
```mermaid
graph TD;
  ir-property-gallery --> ir-icons
  ir-property-gallery --> ir-carousel
  ir-property-gallery --> ir-gallery
  ir-property-gallery --> ir-dialog
  ir-property-gallery --> ir-button
  ir-property-gallery --> ir-room-type-amenities
  ir-carousel --> ir-image
  ir-gallery --> ir-image
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-room-type-amenities --> ir-icons
  ir-booking-page --> ir-property-gallery
  ir-roomtype --> ir-property-gallery
  style ir-property-gallery fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
