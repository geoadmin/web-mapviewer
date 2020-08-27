# web-mapviewer

| Branch | Status | Deployed version |
|--------|--------|------------------|
| develop | ![Build Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiNml3WEJ4dGpETUExUGswQmxnOXdLczNNOFJUMG05dW9GUk5EYWEzL2Nmek1EbFAvYlpNS2FWRkxzTGtxaFpKeWJKallVTmIyOHhrTWZqRnlyUUU3Uk5RPSIsIml2UGFyYW1ldGVyU3BlYyI6IllNU05Qdi9zcUtMSzF4OGciLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop) | http://web-mapviewer.dev.bgdi.ch/ |
| master | ![Build Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiNml3WEJ4dGpETUExUGswQmxnOXdLczNNOFJUMG05dW9GUk5EYWEzL2Nmek1EbFAvYlpNS2FWRkxzTGtxaFpKeWJKallVTmIyOHhrTWZqRnlyUUU3Uk5RPSIsIml2UGFyYW1ldGVyU3BlYyI6IllNU05Qdi9zcUtMSzF4OGciLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master) | http://web-mapviewer.int.bgdi.ch/ |

The next generation map viewer application of geo.admin.ch:  Digital data can be viewed, printed out, ordered and supplied by means of web-mapviewer. The required data is available in the form of digital maps and imagery, vector data and also as online services.

# Table of Contents
1. [Roadmap](#roadmap)
2. [Project structure](#project-structure)
3. [Project setup](#project-setup)
4. [List of npm scripts](#list-of-npm-scripts)
5. [Contributing](#contributing)

## Roadmap

See [ROADMAP.md](ROADMAP.md)

## Project structure

This is a [Vue](https://vuejs.org/) app that is served through `src/main.js`, using [Vuex](https://vuex.vuejs.org/) as a state manager.
The app is divided into modules (or chunks) that are stored into `src/modules`. The goal is for each of these modules to be able to be externalized if needed (they should explicitly state their dependencies in their `index.js`)

Each module should have a root component, called `{Name of the module}Module.vue` that loads all needed component into the template. It should also have a `README.md` file at the root explaining what this module is about.

If the module needs to add data not related to something app wise (for instance, some internal state), a `store` folder can be created with an `index.js` file exporting a Vuex module.
This module can then be imported in the store module (see below)

Here's a sample of what project folder structure looks like :
```
    .
    + -- adr
    |    |    # all architectural decisions made over the course of this project
    + -- cypress
    |    + -- integration
    |    |    |    # all unit test files
    + -- public
    |    |    # all files that don't need pre processing before going public (index.html, favicon, etc...)
    + -- scripts
    |    |    # NodeJS scripts useful for dev tools or for deploy (used by NPM targets)
    + -- src
    |    + -- main.js
    |    + -- App.vue # here's where you should import your module "moduleName" to the app
    |    + -- modules
    |    |    + -- moduleName
    |    |    |    + -- index.js
    |    |    |    # other moduleName related files such as a components folder or a store folder


```


### Architectural decisions

All project related architectural decision will be described in the folder [`/adr`](adr/) (ADR stands for "Architectural Decision Report"). For all more macro decisions (like the CI we use or other broad subjects), please refer to [the `/adr` folder on the project doc-guidelines](https://github.com/geoadmin/doc-guidelines/tree/master/adr).

### Store module
 As there can be only one instance of a Vuex's store per app, the store module is there for that. It as the responsibility to instantiate Vuex, and add any module related state data to the store.
See [its README.md](src/modules/store/README.md) for more details.

### Testing

Unit and integration testing is done with Cypress.io. All things related to tests are in the `/cypress` folder, and more specifically in the folder `/cypress/integration`. See [TESTING.md](cypress/TESTING.md) for more documentation on testing in this project.

## Project setup
```
npm install
```

### Tooling for translation update

Our translation master is hosted in a Google Spreadsheet, thus if you want to update translations you will need a valid Google API Key.
One can be found in our `gopass` store `infra-gopass-bgdi`.

For this purpose you will need to install [gopass](https://github.com/gopasspw/gopass), and to be more efficient use it with [summon](https://github.com/cyberark/summon).

In order for them to function together, they need to be linked with
```bash
mkdir /usr/local/lib/summon
ln -s $(which gopass) /usr/local/lib/summon/gopass
```

Translations can then be updated with
```bash
summon -p gopass npm run update:translations
```
The file `secrets.yml` will tell `summon` which keys to get from `gopass`.

### List of npm scripts

| command | what it does |
|----|----|
| `npm run serve` | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output). You can change port number by using env variable `PORT` (for example `PORT=9999 npm run serve`) |
| `npm run build:dev` | Compiles all file without bundling and minification |
| `npm run build:prod` | Compiles and minifies for production |
| `npm run lint` | Lints and fixes files |
| `npm run test:unit` | Runs unit tests from cypress (equivalent to `npm run cypress:run`). |
| `npm run test:headless` | Starts a local server, using `npm run serve`, and run cypress tests on the served URL (this used by the CI to run tests) |
| `npm run cypress:open` | Opens up the cypress app that lets you run tests with Chrome (or Firefox, but support is still in beta) |
| `npm run cypress:run` | Runs all cypress tests headless, outputs results in the console |
| `npm run deploy:#target#` | Target can be `dev`, `int` or `prod`. Build the app and deploys it on the target S3 Bucket. You need to have an AWS profile that has writing rights on the bucket. If you need to use another profile than the default one, use `AWS_PROFILE=another_profile_name npm run deploy:#target#`. For more information on what the deploy script does, [see below](#what-does-the-deploy-script-do). |
| `npm run update:translations` | Update translation files according to our Google Spreadsheet. See [above](#tooling-for-translation-update) for required tools. |

All script commands starting a webserver or using one (`serve` and all things related to cypress) will determine port to use by looking env variable `PORT`. If not present, will fallback to default port `8080`.

### What about `package-lock.json` file?

The CI uses this file to ensure it will not stumble upon a minor version of a library that breaks the app. So this file needs to be versioned, and kept up to date (each time a new library or version of a library is added to `package.json`, `npm install` will update `package-lock.json` accordingly).

The CI will use `npm ci`, which act like `npm install` but it ignores the file `package.json` and loads all libraries versions found in `pakcage-lock.json` (which are not volatile, e.g. `^1.0.0` or `~1.0.0.`, but fixed).

### What does the deploy script do?

Depending on the target (`dev|int|prod`) it will build and bundle/minify the app (for `int` and `prod`) or simply build the app without minification (for `dev`).
Then it will detect on which git branch you are, and deploy in a subfolder in the bucket if you are not on either `master` or `develop` (`master` and `develop` are deployed at the root of the bucket).

The target bucket will be defined by the target you've specified (`npm run deploy:dev|int`).

- Only `develop` branch can be deployed at the root of the `dev` bucket.
- Only `master` branch can be deployed at the root of `int` and `prod` buckets.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
