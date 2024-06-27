# ir-signup



<!-- Auto Generated Below -->


## Events

| Event      | Description | Type                                                         |
| ---------- | ----------- | ------------------------------------------------------------ |
| `navigate` |             | `CustomEvent<"login" \| "register">`                         |
| `signUp`   |             | `CustomEvent<BeSignUpTrigger \| FBTrigger \| GoogleTrigger>` |


## Dependencies

### Used by

 - [ir-auth](..)

### Depends on

- [ir-input](../../../../ui/ir-input)
- [ir-button](../../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-button --> ir-icons
  ir-auth --> ir-signup
  style ir-signup fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
