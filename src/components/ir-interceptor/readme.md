# ir-interceptor



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute | Description | Type       | Default                                                                |
| ------------------ | --------- | ----------- | ---------- | ---------------------------------------------------------------------- |
| `handledEndpoints` | --        |             | `string[]` | `['/ReAllocate_Exposed_Room', '/Do_Payment', '/Get_Exposed_Bookings']` |


## Dependencies

### Used by

 - [ir-booking-engine](../ir-booking-engine)
 - [ir-invoice](../ir-invoice)

### Graph
```mermaid
graph TD;
  ir-booking-engine --> ir-interceptor
  ir-invoice --> ir-interceptor
  style ir-interceptor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
