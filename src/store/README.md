# Store

This is the [Vuex](https://vuex.vuejs.org/) store used to manage the state of the entire application.

## Structure

The store is split into [modules](https://vuex.vuejs.org/guide/modules.html) (not to be confused with the broader modules of the application) and [plugins](https://vuex.vuejs.org/guide/plugins.html).

### Modules

Modules offer a way to interact with the store by accessing the `state` either directly or through `getters` and by mutating the state directly via `mutations` or wrapped into `actions`.

For instance, all things related to layer management (opacity, order, visibility of layers) are be stored in the module called `layers.store.js`.

### Plugins

Plugins are in essence subscriptions to the store that complement the actions and mutations by the components.

They allow the store to update itself according to events instead of having to add these changes to the events. For instance, the `redo-search-on-lang-change.plugin.js` dispatches a new search after a language change mutation.

## Import

State, getters, mutations, and action don't need to be imported directly but can be bound with the corresponding `map...` methods from Vuex. (e.g. [mapState](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)).

For the cases where an import is necessary it can be done through the `@` resolver.

```js
import { EditableFeatureTypes } from '@/api/features/EditableFeatures.class'
```
