# ir-date-popup



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                              | Default                                 |
| -------- | --------- | ----------- | --------------------------------- | --------------------------------------- |
| `dates`  | --        |             | `{ start: Moment; end: Moment; }` | `{     start: null,     end: null,   }` |


## Events

| Event        | Description | Type                                           |
| ------------ | ----------- | ---------------------------------------------- |
| `dateChange` |             | `CustomEvent<{ start: Moment; end: Moment; }>` |


## Dependencies

### Used by

 - [ir-availability-header](..)

### Depends on

- [ir-icons](../../../../ui/ir-icons)
- [ir-popover](../../../../ui/ir-popover)
- [ir-date-range](../../../../ui/ir-date-range)

### Graph
```mermaid
graph TD;
  ir-date-popup --> ir-icons
  ir-date-popup --> ir-popover
  ir-date-popup --> ir-date-range
  ir-popover --> ir-dialog
  ir-dialog --> ir-button
  ir-button --> ir-icons
  ir-availability-header --> ir-date-popup
  style ir-date-popup fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
