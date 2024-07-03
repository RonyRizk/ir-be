# ir-phone-input



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute       | Description | Type      | Default     |
| --------------- | --------------- | ----------- | --------- | ----------- |
| `country_code`  | `country_code`  |             | `number`  | `undefined` |
| `error`         | `error`         |             | `boolean` | `undefined` |
| `mobile_number` | `mobile_number` |             | `string`  | `undefined` |


## Events

| Event             | Description | Type                                                     |
| ----------------- | ----------- | -------------------------------------------------------- |
| `phoneInputBlur`  |             | `CustomEvent<FocusEvent>`                                |
| `phoneInputFocus` |             | `CustomEvent<FocusEvent>`                                |
| `textChange`      |             | `CustomEvent<{ phone_prefix: string; mobile: string; }>` |


## Dependencies

### Used by

 - [ir-user-form](../../ir-booking-engine/ir-checkout-page/ir-user-form)
 - [ir-user-profile](../../ir-booking-engine/ir-nav/ir-user-profile)

### Depends on

- [ir-icons](../ir-icons)

### Graph
```mermaid
graph TD;
  ir-phone-input --> ir-icons
  ir-user-form --> ir-phone-input
  ir-user-profile --> ir-phone-input
  style ir-phone-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
