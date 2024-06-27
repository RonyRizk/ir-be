# ir-coupon-dialog



<!-- Auto Generated Below -->


## Events

| Event          | Description | Type                  |
| -------------- | ----------- | --------------------- |
| `resetBooking` |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [ir-availibility-header](..)

### Depends on

- [ir-button](../../../../ui/ir-button)
- [ir-icons](../../../../ui/ir-icons)
- [ir-dialog](../../../../ui/ir-dialog)
- [ir-input](../../../../ui/ir-input)

### Graph
```mermaid
graph TD;
  ir-coupon-dialog --> ir-button
  ir-coupon-dialog --> ir-icons
  ir-coupon-dialog --> ir-dialog
  ir-coupon-dialog --> ir-input
  ir-button --> ir-icons
  ir-dialog --> ir-button
  ir-availibility-header --> ir-coupon-dialog
  style ir-coupon-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
