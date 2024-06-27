# ir-drawer



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description | Type                                     | Default   |
| ----------- | ----------- | ----------- | ---------------------------------------- | --------- |
| `contained` | `contained` |             | `boolean`                                | `false`   |
| `label`     | `label`     |             | `string`                                 | `''`      |
| `noHeader`  | `no-header` |             | `boolean`                                | `false`   |
| `open`      | `open`      |             | `boolean`                                | `false`   |
| `placement` | `placement` |             | `"bottom" \| "left" \| "right" \| "top"` | `'right'` |


## Events

| Event                        | Description                                                                                                                                                                                            | Type                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `six-drawer-after-hide`      | Emitted after the drawer closes and all transitions are complete.                                                                                                                                      | `CustomEvent<null>` |
| `six-drawer-after-show`      | Emitted after the drawer opens and all transitions are complete.                                                                                                                                       | `CustomEvent<null>` |
| `six-drawer-hide`            | Emitted when the drawer closes. Calling `event.preventDefault()` will prevent it from being closed.                                                                                                    | `CustomEvent<null>` |
| `six-drawer-initial-focus`   | Emitted when the drawer opens and the panel gains focus. Calling `event.preventDefault()` will prevent focus and allow you to set it on a different element in the drawer, such as an input or button. | `CustomEvent<null>` |
| `six-drawer-overlay-dismiss` | Emitted when the overlay is clicked. Calling `event.preventDefault()` will prevent the drawer from closing.                                                                                            | `CustomEvent<null>` |
| `six-drawer-show`            |                                                                                                                                                                                                        | `CustomEvent<null>` |


## Methods

### `hide() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"base"`    |             |
| `"body"`    |             |
| `"footer"`  |             |
| `"header"`  |             |
| `"overlay"` |             |
| `"panel"`   |             |
| `"title"`   |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
