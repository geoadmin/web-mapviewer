# Overlay module

Shows an overlay over the element (`z-index` is 500). Will call all callbacks given when showing the overlay on close 
(and then clean the callback list).

## State properties

| Name | Content |
| ---- | ------- |
| `show` | telling if the overlay is visible or not (transparent layer on top of the element preventing interactions). |
| `callbacksOnClose` | It is possible to register callback functions (when showing the overlay) that will be called when the overlay is being hidden. |
