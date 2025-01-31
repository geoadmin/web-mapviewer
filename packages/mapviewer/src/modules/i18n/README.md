# Internationalization (i18n) module

- [Quick guide](#quick-guide)
- [Formatting messages](#formatting-messages)
- [update translations](#update-translations)
- [State properties](#state-properties)
  - [Noteworthy mutation](#noteworthy-mutation)

## Quick guide

Responsible for loading and serving `vue-i18n`. This utils can be accessed by linking the result of `useI18n()`
to a local ref (in Composition API) or in-place with the Option API. As we've deactivated the legacy support,
it's not possible to use `this.$i18n` anymore, we must now go through the `useI18n()` function to
get a reference to the utils.

Here's an example of how to use this translation :

```javascript
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
```

```html
<label for="...">{{ i18n.t('a_translation_key') }}</label>
```

Current locale can be accessed through the store

```javascript
import { useStore } from 'vuex'
import { computed } from 'vue'

const store = useStore()
const currentLocal = computed(() => store.state.i18n.lang)
```

```html
<span>Current locale is {{ currentLocal }}</span>
```

Within your Option API Vue Component javascript code, you can access translation like this

```javascript
useI18n().t('a_translation_key')
```

Or if you have multiple call to `t(...)`, you can store the reference given by `useI18n()` at some point (do not store it in `data()`)

## Formatting messages

Some message might require some formatting from the application to do so you can use the `{placeholder}` notation in the translation key and then use `i18n.t('my_formatted_key', {placeholder: 'my placeholder'})`

See [i18n guide](https://kazupon.github.io/vue-i18n/guide/formatting.html)

## update translations

See [the main README.md's section on that](../../../README.md#tooling-for-translation-update)

## State properties

| Name        | Content                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `i18n.lang` | the current language, expressed as an ISO code (`en`,`de`,`fr`,etc...) |

### Noteworthy mutation

This module exports the mutation name for lang change (search for `SET_LANG_MUTATION_KEY`). This enables any store plugin (or other subscriber to the store) to listen to lang change without hard coding the mutation name in their code.
