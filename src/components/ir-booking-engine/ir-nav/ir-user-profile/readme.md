# ir-user-profile



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute | Description | Type                                                                                                                                                                                                                                                            | Default |
| ----------- | --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `user_data` | --        |             | `{ address?: string; id?: number; email?: string; first_name?: string; last_name?: string; country_id?: number; country_phone_prefix?: string; city?: string; dob?: string; mobile?: number; subscribe_to_news_letter?: boolean; alternative_email?: string; }` | `{}`    |


## Dependencies

### Used by

 - [ir-booking-engine](../..)
 - [ir-nav](..)

### Depends on

- [ir-input](../../../ui/ir-input)
- [ir-select](../../../ui/ir-select)
- [ir-phone-input](../../../ui/ir-phone-input)
- [ir-checkbox](../../../ui/ir-checkbox)
- [ir-button](../../../ui/ir-button)

### Graph
```mermaid
graph TD;
  ir-user-profile --> ir-input
  ir-user-profile --> ir-select
  ir-user-profile --> ir-phone-input
  ir-user-profile --> ir-checkbox
  ir-user-profile --> ir-button
  ir-phone-input --> ir-icons
  ir-button --> ir-icons
  ir-booking-engine --> ir-user-profile
  ir-nav --> ir-user-profile
  style ir-user-profile fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
