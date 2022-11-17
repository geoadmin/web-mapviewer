# Map module

Responsible for rendering the map according to the state, handles click on the map and acts accordingly (making API call to the backend for identify, or drawing)

## State properties

| Name                      | Content                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map.highlightedFeatures` | List of features to be highlighted on the map (e.g. after a click), see `features.api.js` for more info on that                                                                       |
| `map.highlightedLayer`    | Single layer that should be on top of everything else, useful to preview a layer while hovering it in the menus                                                                       |
| `map.isBeingDragged`      | `true` when the underlying map experiences a drag event from the mouse, goes back to `false` as soon as the interaction ends (doesn't trigger `true` on a click, only on drag events) |
| `map.clickInfo`           | Information about the last click that has occurred on the map, including how long the click was                                                                                       |
| `map.pinnedLocation`      | Coordinate for a dropped pin on the map (only one at a time)                                                                                                                          |
