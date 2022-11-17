# Internationalization (i18n) module

Responsible for loading and serving `vue-i18n` through the `$t` function in templates.

Here's an example how to use this translation :

```html
<label for="...">{{ $t('a_translation_key') }}</label>
```

Current locale can be accessed through

```html
<span>Current locale is {{ $i18n.locale }}</span>
```

### update translations

See [the main README.md's section on that](../../../README.md#tooling-for-translation-update)

## State properties

| Name        | Content                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `i18n.lang` | the current language, expressed as an ISO code (`en`,`de`,`fr`,etc...) |

### Noteworthy mutation

This module exports the mutation name for lang change (search for `SET_LANG_MUTATION_KEY`). This enables any store plugin (or other subscriber to the store) to listen to lang change without hard coding the mutation name in their code.
