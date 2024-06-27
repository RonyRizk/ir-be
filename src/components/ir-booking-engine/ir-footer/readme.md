# ir-footer



<!-- Auto Generated Below -->


## Dependencies

### Used by

 - [ir-booking-engine](..)
 - [ir-booking-listing](../ir-booking-listing)
 - [ir-invoice](../../ir-invoice)

### Depends on

- [ir-button](../../ui/ir-button)
- [ir-privacy-policy](../ir-privacy-policy)
- [ir-icons](../../ui/ir-icons)
- [ir-dialog](../../ui/ir-dialog)

### Graph
```mermaid
graph TD;
  ir-footer --> ir-button
  ir-footer --> ir-privacy-policy
  ir-footer --> ir-icons
  ir-footer --> ir-dialog
  ir-button --> ir-icons
  ir-privacy-policy --> ir-button
  ir-privacy-policy --> ir-dialog
  ir-dialog --> ir-button
  ir-booking-engine --> ir-footer
  ir-booking-listing --> ir-footer
  ir-invoice --> ir-footer
  style ir-footer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
