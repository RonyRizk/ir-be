# ir-modal



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type          | Default     |
| --------- | --------- | ----------- | ------------- | ----------- |
| `element` | --        |             | `HTMLElement` | `undefined` |


## Events

| Event        | Description | Type                                                                                                                                              |
| ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authStatus` |             | `CustomEvent<{ state: "success" \| "failed"; token: string; payload: { method: "google" \| "direct"; email?: string; booking_nbr?: string; }; }>` |
| `openChange` |             | `CustomEvent<boolean>`                                                                                                                            |


## Methods

### `closeModal() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `openModal() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ir-nav](../../ir-booking-engine/ir-nav)

### Depends on

- [ir-auth](../../ir-booking-engine/ir-nav/ir-auth)

### Graph
```mermaid
graph TD;
  ir-modal --> ir-auth
  ir-auth --> ir-signin
  ir-auth --> ir-signup
  ir-auth --> ir-button
  ir-signin --> ir-badge-group
  ir-signin --> ir-input
  ir-badge-group --> ir-icons
  ir-signup --> ir-input
  ir-signup --> ir-button
  ir-button --> ir-icons
  ir-nav --> ir-modal
  style ir-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
