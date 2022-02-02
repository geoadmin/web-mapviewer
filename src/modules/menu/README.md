# Menu module

Adds a header bar on top of the screen that contains the search bar, and the language switch

Adds a menu tray that can be opened on the side of the app, containing much of the controls the user has (layer list, drawing, print, etc...)

Add a toolbox to the app that make possible to change the background, enables zooming, panning, and all other camera, position or zoom related values.

Adds a search bar to the UI with all related UI elements (search results managements, etc...)

## Dependencies

- Will import the lang switch button from the `i18n` module.

## State properties

| Name | Content |
| ---- | ------- |
| `search.pending` | telling if a search requesting is ongoing with the backend |
| `search.query` | will trigger a search to the backend if it contains 3 or more characters |
| `search.results` | results from the backend for the current search query |
| `search.show` | telling if search results should visible |
