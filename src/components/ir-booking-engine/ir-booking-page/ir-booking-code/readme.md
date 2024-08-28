# ir-booking-code



<!-- Auto Generated Below -->


## Events

| Event          | Description | Type                  |
| -------------- | ----------- | --------------------- |
| `closeDialog`  |             | `CustomEvent<null>`   |
| `resetBooking` |             | `CustomEvent<string>` |


## Methods

### `clearAgent() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-nav](../../ir-nav)

### Depends on

- [ir-input](../../../ui/ir-input)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-booking-code --> ir-input
  ir-booking-code --> ir-button
  ir-button --> ir-icons
  ir-nav --> ir-booking-code
  style ir-booking-code fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
