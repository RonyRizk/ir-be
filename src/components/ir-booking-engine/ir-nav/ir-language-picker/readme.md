# ir-language-picker



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute | Description | Type                  | Default     |
| ------------ | --------- | ----------- | --------------------- | ----------- |
| `currencies` | --        |             | `ICurrency[]`         | `undefined` |
| `languages`  | --        |             | `IExposedLanguages[]` | `undefined` |


## Events

| Event             | Description | Type                  |
| ----------------- | ----------- | --------------------- |
| `closeDialog`     |             | `CustomEvent<null>`   |
| `languageChanged` |             | `CustomEvent<string>` |
| `resetBooking`    |             | `CustomEvent<null>`   |


## Dependencies

### Used by

 - [ir-nav](..)

### Depends on

- [ir-select](../../../ui/ir-select)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-language-picker --> ir-select
  ir-language-picker --> ir-button
  ir-button --> ir-icons
  ir-nav --> ir-language-picker
  style ir-language-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
