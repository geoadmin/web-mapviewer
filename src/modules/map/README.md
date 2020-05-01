# Map module

Responsible for rendering the map according to the state, handles click on the map and acts accordingly (making API call to the backend for identify, or drawing)

## State properties

| Name | Content |
| ---- | ------- |
| `identify` | `Object` (structure is `coordinate: { latitude: 0, longitude: 0 }, results: []`) that contains last coordinate used for identify, and the result of this identify on the backend |
| `draw` | coordinates added while `clickMode` was `DRAWING` |
| `clickMode` | Enumerate defining how should click be handled, either by identifying at coordinate, or adding a new drawing point |
