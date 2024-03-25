# Store

This is the [Vuex](https://vuex.vuejs.org/) store used to manage the state of the entire application.

- [Structure](#structure)
  - [Modules](#modules)
  - [Plugins](#plugins)
- [Nomenclature](#nomenclature)
- [Best Practices](#best-practices)
- [Import](#import)

## Structure

The store is split into [modules](https://vuex.vuejs.org/guide/modules.html) (not to be confused with the broader modules of the application) and [plugins](https://vuex.vuejs.org/guide/plugins.html).

### Modules

Modules offer a way to interact with the store by accessing the `state` either directly or through `getters` and by mutating the state directly via `mutations` or wrapped into `actions`.

For instance, all things related to layer management (opacity, order, visibility of layers) are be stored in the module called `layers.store.js`.

### Plugins

Plugins are in essence subscriptions to the store that complement the actions and mutations by the components.

They allow the store to update itself according to events instead of having to add these changes to the events. For instance, the `redo-search-when-needed.plugin.js` dispatches a new search after a language change mutation.

## Nomenclature

- Store module main file MUST END with `.store.js`
- Plugin main file MUST END with `.plugin.js`
- Store action and mutation name SHOULD start with a verb
- Store action and mutation name should be the same whenever possible
- Dispatcher name SHOULD have one of the form: `SOURCE_NAME` or `SOURCE_NAME/ACTION`
  - `SOURCE_NAME` := [PLUGIN_NAME | VUE_COMPONENT_NAME | STORE_NAME] Name of the source, which is one of the following
    - PLUGIN_NAME := name of the store plugin or router plugin without `.js` extension; `load-kml-data.plugin`, `storeSync.routerPluging`
    - VUE_COMPONENT := name of the vue component with `.vue` extension; `SharePopup.vue`
    - STORE_NAME := name of the store; `app.store`
  - `ACTION` := action that trigger the dispatch; e.g. store action name, component event or function name, ...
- Action/mutation value name should be the same as the store parameter that is changed:

  ```javascript
  setTopics: ({ commit }, {topics, dispatcher}) => {
        if (Array.isArray(topics)) {
            commit('setTopis', {topics, dispatcher})
        }
    },
  ```

## Best Practices

- Uses string for action, mutation and dispatcher to avoid module interdependencies (no variable exports)
- Avoid too many plugins and small plugins, always check if the use case can fit in existing plugins. Having too many plugins has a negative impact on performance.
- Avoid too many action dispatching. Dispatching action cost in performance, so avoid dispatching too many action in a loop, prefer bulk action. For example don't use `addLayer` action in a loop to add several action, but use `setLayers` action
- Actions and mutations SHOULD always have an object as payload with the `dispatcher` key.
- When dispatching action, we SHOULD always add the `dispatcher` to the payload.
- In subscribers uses the action/mutation `dispatcher` to make descisions (instead of local flags). For example to avoid endless loop due to self action dispatch in subscriber.

## Import

State, getters, mutations, and action don't need to be imported directly but can be bound with the corresponding `map...` methods from Vuex. (e.g. [mapState](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)).

For the cases where an import is necessary it can be done through the `@` resolver.

```js
import { EditableFeatureTypes } from '@/api/features/EditableFeatures.class'
```
