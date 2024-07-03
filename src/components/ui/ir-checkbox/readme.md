# ir-checkbox



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type      | Default     |
| ------------ | ------------- | ----------- | --------- | ----------- |
| `checkboxId` | `checkbox-id` |             | `string`  | `v4()`      |
| `checked`    | `checked`     |             | `boolean` | `false`     |
| `disabled`   | `disabled`    |             | `boolean` | `undefined` |
| `label`      | `label`       |             | `string`  | `undefined` |
| `name`       | `name`        |             | `string`  | `undefined` |


## Events

| Event         | Description | Type                   |
| ------------- | ----------- | ---------------------- |
| `checkChange` |             | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [ir-booking-summary](../../ir-booking-engine/ir-checkout-page/ir-booking-summary)
 - [ir-user-form](../../ir-booking-engine/ir-checkout-page/ir-user-form)
 - [ir-user-profile](../../ir-booking-engine/ir-nav/ir-user-profile)

### Graph
```mermaid
graph TD;
  ir-booking-summary --> ir-checkbox
  ir-user-form --> ir-checkbox
  ir-user-profile --> ir-checkbox
  style ir-checkbox fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
