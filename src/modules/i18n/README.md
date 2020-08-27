# Internationalization (i18n) module

Responsible for loading and serving `vue-i18n` through the `$t` function in templates.

Here's an example how to use this translation :
```html
    <label for="...">{{ $t('a_translation_key')  }}</label>
```

Current locale can be accessed through
```html
    <span>Current locale is {{ $i18n.locale }}</span>
```

### update translations

See [the main README.md's section on that](../../../README.md#tooling-for-translation-update)
