# ir-adult-child-counter



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type     | Default |
| ------------------ | -------------------- | ----------- | -------- | ------- |
| `adultCount`       | `adult-count`        |             | `number` | `0`     |
| `childMaxAge`      | `child-max-age`      |             | `number` | `0`     |
| `childrenCount`    | `children-count`     |             | `number` | `0`     |
| `maxAdultCount`    | `max-adult-count`    |             | `number` | `10`    |
| `maxChildrenCount` | `max-children-count` |             | `number` | `10`    |
| `minAdultCount`    | `min-adult-count`    |             | `number` | `0`     |
| `minChildrenCount` | `min-children-count` |             | `number` | `0`     |


## Events

| Event                  | Description | Type                                                     |
| ---------------------- | ----------- | -------------------------------------------------------- |
| `addAdultsAndChildren` |             | `CustomEvent<{ adult_nbr: number; child_nbr: number; }>` |


## Dependencies

### Used by

 - [ir-availibility-header](../ir-availibility-header)

### Depends on

- [ir-icons](../../../ui/ir-icons)
- [ir-popover](../../../ui/ir-popover)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-adult-child-counter --> ir-icons
  ir-adult-child-counter --> ir-popover
  ir-adult-child-counter --> ir-button
  ir-popover --> ir-dialog
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-availibility-header --> ir-adult-child-counter
  style ir-adult-child-counter fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
