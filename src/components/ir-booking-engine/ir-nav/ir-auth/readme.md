# ir-auth



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute        | Description | Type      | Default |
| -------------- | ---------------- | ----------- | --------- | ------- |
| `enableSignUp` | `enable-sign-up` |             | `boolean` | `true`  |


## Events

| Event         | Description | Type                |
| ------------- | ----------- | ------------------- |
| `closeDialog` |             | `CustomEvent<null>` |


## Dependencies

### Used by

 - [ir-booking-listing](../../ir-booking-listing)
 - [ir-modal](../../../ui/ir-modal)

### Depends on

- [ir-signin](ir-signin)
- [ir-signup](ir-signup)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-signin --> ir-button
  ir-badge-group --> ir-icons
  ir-button --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-booking-listing --> ir-auth
  ir-modal --> ir-auth
  style ir-auth fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
