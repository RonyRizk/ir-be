# ir-select



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type                                                                             | Default     |
| ---------------- | ------------------ | ----------- | -------------------------------------------------------------------------------- | ----------- |
| `addDummyOption` | `add-dummy-option` |             | `boolean`                                                                        | `false`     |
| `containerStyle` | `container-style`  |             | `string`                                                                         | `''`        |
| `customStyles`   | `custom-styles`    |             | `string`                                                                         | `''`        |
| `data`           | --                 |             | `{ id: string \| number; value: string; disabled?: boolean; html?: boolean; }[]` | `undefined` |
| `icon`           | `icon`             |             | `boolean`                                                                        | `undefined` |
| `label`          | `label`            |             | `string`                                                                         | `undefined` |
| `select_id`      | `select_id`        |             | `string`                                                                         | `v4()`      |
| `value`          | `value`            |             | `number \| string`                                                               | `undefined` |
| `variant`        | `variant`          |             | `"default" \| "double-line"`                                                     | `'default'` |


## Events

| Event         | Description | Type                            |
| ------------- | ----------- | ------------------------------- |
| `valueChange` |             | `CustomEvent<number \| string>` |


## Dependencies

### Used by

 - [ir-adult-child-counter](../../ir-booking-engine/ir-booking-page/ir-adult-child-counter)
 - [ir-booking-details](../../ir-booking-engine/ir-checkout-page/ir-booking-details)
 - [ir-guest-counter](../../ir-guest-counter)
 - [ir-language-picker](../../ir-booking-engine/ir-nav/ir-language-picker)
 - [ir-multi-property-widget](../../ir-booking-widget/ir-multi-property-widget)
 - [ir-payment-view](../../ir-booking-engine/ir-checkout-page/ir-booking-summary/ir-payment-view)
 - [ir-pickup](../../ir-booking-engine/ir-checkout-page/ir-pickup)
 - [ir-rateplan](../../ir-booking-engine/ir-booking-page/ir-rateplan)
 - [ir-user-form](../../ir-booking-engine/ir-checkout-page/ir-user-form)
 - [ir-user-profile](../../ir-booking-engine/ir-nav/ir-user-profile)

### Graph
```mermaid
graph TD;
  ir-adult-child-counter --> ir-select
  ir-booking-details --> ir-select
  ir-guest-counter --> ir-select
  ir-language-picker --> ir-select
  ir-multi-property-widget --> ir-select
  ir-payment-view --> ir-select
  ir-pickup --> ir-select
  ir-rateplan --> ir-select
  ir-user-form --> ir-select
  ir-user-profile --> ir-select
  style ir-select fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
