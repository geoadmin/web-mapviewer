# Store module

This module will declare the store for the app, using `Vuex`

## How data is organized

This module contains also a `modules` folder that contains each business modules present in the store (not to be confused with the broader modules of the application).
For instance, all things related to layer management (opacity, order, visibility of layers) will be stored in a dedicated `store` module called `layers.js`.

When a set of store values are specific to a single app module, this module should be stored into the module in a `/store` folder (see `map` module for an example)


## Importing vuex modules from another app module

If your module has to add something to the store, it can be done in `index.js`
It can be imported with a `import "@/module/{your module name}/store"`, for an example see `map` module.
