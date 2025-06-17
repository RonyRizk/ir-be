# ir-alert-dialog



<!-- Auto Generated Below -->


## Events

| Event        | Description | Type                   |
| ------------ | ----------- | ---------------------- |
| `openChange` |             | `CustomEvent<boolean>` |


## Methods

### `closeModal() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `openModal() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-booking-cancellation](../../ir-booking-cancellation)
 - [ir-checkout-page](../../ir-booking-engine/ir-checkout-page)
 - [ir-interceptor](../../ir-interceptor)

### Graph
```mermaid
graph TD;
  ir-booking-cancellation --> ir-alert-dialog
  ir-checkout-page --> ir-alert-dialog
  ir-interceptor --> ir-alert-dialog
  style ir-alert-dialog fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
