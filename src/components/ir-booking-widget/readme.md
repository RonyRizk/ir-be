# ir-booking-widget



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute      | Description | Type                                                                                              | Default     |
| ----------------------- | -------------- | ----------- | ------------------------------------------------------------------------------------------------- | ----------- |
| `aName`                 | `a-name`       |             | `string`                                                                                          | `null`      |
| `baseUrl`               | `base-url`     |             | `string`                                                                                          | `undefined` |
| `contentContainerStyle` | --             |             | `{ color?: string; height?: string; width?: string; borderColor?: string; background?: string; }` | `undefined` |
| `language`              | `language`     |             | `string`                                                                                          | `'en'`      |
| `perma_link`            | `perma_link`   |             | `string`                                                                                          | `null`      |
| `position`              | `position`     |             | `"block" \| "sticky"`                                                                             | `'sticky'`  |
| `propertyId`            | `property-id`  |             | `number`                                                                                          | `42`        |
| `roomTypeId`            | `room-type-id` |             | `string`                                                                                          | `'110'`     |


## Dependencies

### Depends on

- [ir-icons](../ui/ir-icons)
- [ir-popover](../ui/ir-popover)
- [ir-date-range](../ui/ir-date-range)
- [ir-guest-counter](../ir-guest-counter)

### Graph
```mermaid
graph TD;
  ir-booking-widget --> ir-icons
  ir-booking-widget --> ir-popover
  ir-booking-widget --> ir-date-range
  ir-booking-widget --> ir-guest-counter
  ir-popover --> ir-dialog
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-guest-counter --> ir-button
  style ir-booking-widget fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
