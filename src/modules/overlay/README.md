# Overlay module

Shows an overlay over the element (CSS `z-index` is 499). Will call all callbacks given when closing the overlay (and then clean the callback list).

Most (if not all) actions made on this overlay are made through the store plugin `menu-search-overlay-interaction.plugin.js`

## State properties

| Name | Content |
| ---- | ------- |
| `overlay.show` | telling if the overlay is visible or not (transparent layer on top of the element preventing interactions). |
| `overlay.callbacksOnClose` | It is possible to register callback functions (when showing the overlay) that will be called when the overlay is being hidden. |
