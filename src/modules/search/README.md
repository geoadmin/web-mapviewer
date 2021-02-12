# Search module

Adds a search bar to the UI with all related UI elements (search results managements, etc...)

## State properties

| Name | Content |
| ---- | ------- |
| `search.pending` | telling if a search requesting is ongoing with the backend |
| `search.query` | will trigger a search to the backend if it contains 3 or more characters |
| `search.results` | results from the backend for the current search query |
| `search.show` | telling if search results should visible |
