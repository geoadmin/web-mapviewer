# web-mapviewer
The viewer application for maps and geodata

## Project structure

This is a Vue app, that is served through `src/main.js`.
The app is divided into modules (or chunks) that are stored into `src/modules`. The goal is for each of these modules to be able to be externalized if needed (they should explicitly state their dependencies in their `index.js`)

Each module should have a root component, called `{Name of the module}Module.vue` that loads all needed component into the template. It should also have a `README.md` file at the root explaining what this module is about.

If the module needs to add data not related to something app wise (for instance, some internal state), a `store` folder can be created with an `index.js` file exporting a Vuex module.
This module can then be imported in the store module (see below)

### Store module
 As there can be only one instance of a Vuex's store per app, the store module is there for that. It as the responsibility to instantiate Vuex, and add any module related state data to the store.
See [its README.md](src/modules/store/README.md) for more details.

### Testing

Unit and integration testing is done with Cypress.io. All things related to tests are in the `/cypress` folder, and more specifically in the folder `/cypress/integration`. See [TESTING.md](cypress/TESTING.md) for more documentation on testing in this project.

## Project setup
```
npm install
```

### List of npm scripts

| command | what it does |
|----|----|
| `npm run serve` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output) |
| `npm run build` | Compiles and minifies for production |
| `npm run lint` | Lints and fixes files | 
| `npm run test:unit` | Runs unit tests from cypress (equivalent to `npm run cypress:run`) |
| `npm run cypress:open` | Opens up the cypress app that lets you run tests with Chrome |
| `npm run cypress:run` | Runs all cypress tests headless, outputs results in the console |


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
