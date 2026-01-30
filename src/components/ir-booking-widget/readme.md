# ir-booking-widget



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute      | Description | Type                 | Default     |
| ------------ | -------------- | ----------- | -------------------- | ----------- |
| `aff`        | `aff`          |             | `string`             | `null`      |
| `delay`      | `delay`        |             | `number`             | `300`       |
| `l`          | `l`            |             | `string`             | `undefined` |
| `language`   | `language`     |             | `string`             | `'en'`      |
| `p`          | `p`            |             | `string`             | `null`      |
| `perma_link` | `perma_link`   |             | `string`             | `null`      |
| `pool`       | `pool`         |             | `string`             | `undefined` |
| `position`   | `position`     |             | `"block" \| "fixed"` | `'fixed'`   |
| `propertyId` | `property-id`  |             | `number`             | `42`        |
| `roomTypeId` | `room-type-id` |             | `string`             | `null`      |


## Shadow Parts

| Part                | Description |
| ------------------- | ----------- |
| `"anchor"`          |             |
| `"container"`       |             |
| `"cta"`             |             |
| `"header"`          |             |
| `"hover"`           |             |
| `"property-select"` |             |


## Dependencies

### Depends on

- [ir-multi-property-widget](ir-multi-property-widget)
- [ir-popup](../ui/ir-popup)
- [ir-button](../ui/ir-button)
- [ir-widget-date-popup](ir-widget-date-popup)
- [ir-widget-occupancy-popup](ir-widget-occupancy-popup)

### Graph
```mermaid
graph TD;
  ir-widget --> ir-multi-property-widget
  ir-widget --> ir-popup
  ir-widget --> ir-button
  ir-widget --> ir-widget-date-popup
  ir-widget --> ir-widget-occupancy-popup
  ir-multi-property-widget --> ir-select
  ir-multi-property-widget --> ir-icons
  ir-multi-property-widget --> ir-widget-date-popup
  ir-multi-property-widget --> ir-widget-occupancy-popup
  ir-multi-property-widget --> ir-button
  ir-widget-date-popup --> ir-icons
  ir-widget-date-popup --> ir-date-range
  ir-widget-date-popup --> ir-popup
  ir-widget-date-popup --> ir-button
  ir-button --> ir-icons
  ir-widget-occupancy-popup --> ir-icons
  ir-widget-occupancy-popup --> ir-popup
  ir-widget-occupancy-popup --> ir-guest-counter
  ir-guest-counter --> ir-button
  ir-guest-counter --> ir-select
  style ir-widget fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
