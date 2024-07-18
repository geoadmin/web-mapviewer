# web-mapviewer

<!-- prettier-ignore -->
| Branch  | CI Status  | E2E Tests | Deployed version |
| ------- | ---------- | --------- | ---------------- |
| develop | ![Build Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiZVJxNnZVc2ZLdkw0cFA2bkI3VWpFQ2QxY3N0U3ZBa2tWZUh1SmZkQUY5QkNiQkhpL1VkS3YrZjVpa2E0eGNOVTgwM01LeUlYTjZiamdXRUdZd25nUXhZPSIsIml2UGFyYW1ldGVyU3BlYyI6ImhXQWxHWjBuRXU3RjVwczIiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=develop) | [![web-mapviewer](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/fj2ezv/develop&style=plastic&logo=cypress)](https://cloud.cypress.io/projects/fj2ezv/runs) | <https://sys-map.dev.bgdi.ch/> |
| master  | ![Build Status](https://codebuild.eu-central-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiZVJxNnZVc2ZLdkw0cFA2bkI3VWpFQ2QxY3N0U3ZBa2tWZUh1SmZkQUY5QkNiQkhpL1VkS3YrZjVpa2E0eGNOVTgwM01LeUlYTjZiamdXRUdZd25nUXhZPSIsIml2UGFyYW1ldGVyU3BlYyI6ImhXQWxHWjBuRXU3RjVwczIiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master) | [![web-mapviewer](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/fj2ezv/master&style=plastic&logo=cypress)](https://cloud.cypress.io/projects/fj2ezv/runs) | <https://sys-map.int.bgdi.ch/> |

The next generation map viewer application of geo.admin.ch: Digital data can be viewed, printed out, ordered and supplied by means of web-mapviewer. The required data is available in the form of digital maps and imagery, vector data and also as online services.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Contributing](#contributing)
- [Project structure](#project-structure)
  - [Best practices](#best-practices)
  - [Vue Composition API](#vue-composition-api)
  - [Store module](#store-module)
  - [Testing](#testing)
- [Project setup](#project-setup)
  - [Pre-Requirements](#pre-requirements)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Tooling for translation update](#tooling-for-translation-update)
  - [List of npm scripts](#list-of-npm-scripts)
  - [What about `package-lock.json` file?](#what-about-package-lockjson-file)
- [Project deployment](#project-deployment)
  - [Automatic deploy](#automatic-deploy)
  - [Manual deploy](#manual-deploy)
- [Check External Layer Provider list](#check-external-layer-provider-list)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Project structure

This is a [Vue](https://vuejs.org/) app that is served through `src/main.js`, using [Vuex](https://vuex.vuejs.org/) as a state manager.
The app is divided into modules (or chunks) that are stored into `src/modules`. The goal is for each of these modules to be able to be externalized if needed. They should explicitly state their dependencies to other modules' component or store element in their `README.md` (dependency to the main store's modules is not required to be stated)

Each module should have a root component, called `{Name of the module}Module.vue` that loads all needed component into the template. It should also have a `README.md` file at the root explaining what this module is about.

To make the code easier to navigate and maintain we consolidated the complete state in one place (`src/store/`). The store is divided into modules that mostly correspond to the application modules but also include modules for state that is used by multiple modules or would be too big for a single file.

Store plugins can be used to react to store changes. See the [store read-me](src/store/README.md) for more information.

Here's a sample of what project folder structure looks like :

```text
├── tests
│   └── all test files
│
├── public
│   └── all files that don't need pre processing before going public
│       (index.html, favicon, etc...)
│
├── scripts
│   └── NodeJS scripts useful for dev tools or for deploy
│       (used by NPM targets)
│
├── src
│   ├── main.js
│   ├── App.vue
│   ├── modules
│   │   ├── <Module name>
│   │   │   ├── index.js
│   │   │   └── other moduleName related files such as
│   │           a components folder or a store folder
│   ├── store
│   │   ├── modules
│   │   │   ├── <Module name>.js
```

### Best practices

- Prefer primitive data or javascript plain object in reactive data (Vue Component data or refs, Vuex store data)
- Don't use complex object as reactive data
- Avoid using javascript getter and setter in class that are used in reactive data

See also [Store Best Practices](./src/store/README.md#best-practices)

### Vue Composition API

New components should be written using the Vue Composition API.

The structure of the file should be :

- `<script setup>` tag should be the first tag of the `.vue` file (instead of `<template>`, that's the new best practice with this approach)
- declares things in this order in the `<script setup>` tag
  1. imports
  1. props (input)
  1. data
  1. store mapping (input)
  1. computed (transformation of inputs)
  1. watchs
  1. life-cycle hooks (mounted and such)
  1. interaction with the user (was called `methods` in the OptionAPI)

```vue
<script setup>
// 1. First put the imports
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

// 2. Put all the props (input)
const props = defineProps({
  myProp: {
    type: Boolean,
    default: false,
  },
})
const { myProp } = toRefs(props)

// 3. reactive data
const myData = ref('My reactive value')

// 4. Put then all store mapping (input)
const store = useStore()

// 5. Computed properties
const myComputed = computed(() => store.state.myValue)

// 6. Watchs
watch(myComputed, (newValue) => {
  // do something on myComputed changes
})

// 7. Life-cycle hooks
onMounted(() => {
  // write you code here
})

// 8. Methods
function myMethod() {}
</script>

<template>
  <!-- Write your template here -->
</template>

<style lang="scss" scoped>
// Write your styles here
</style>
```

Components that are extensively edited should be rewritten using the Composition API

### Store module

As there can be only one instance of a Vuex's store per app, the store module is there for that. It as the responsibility to instantiate Vuex, and add any module related state data to the store.
See [its README.md](src/store/README.md) for more details.

### Testing

Unit testing is done through the VueCLI unit test helper, and integration testing is done with Cypress.io.
All things related to tests are in the `/tests` folder.
See [README.md](./tests/README.md) for more documentation on testing in this project.

## Project setup

### Pre-Requirements

The followings programs/tools are required in order to develop on `web-mapviewer`

- Nodejs 18
- npm 10

### Install

```bash
npm install
```

### Environment variables

Environment variables are defined in the following files

- .env.development
- .env.integration
- .env.prodcution

The first one is used by `npm run dev` as well as for all `development` modes. The second is used to build for and deploy to our integration server. Otherwise `.env.production` is used by default.
For more information about loading environment variables see [Vue - Modes and Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html#modes-and-environment-variables)

### Tooling for translation update

Our translation master is hosted in a Google Spreadsheet, thus if you want to update translations you will need a valid Google API Key.
One can be found in our AWS SSM store in `swisstopo-bgdi-builder` account.

In order to easily access the google API key stored in AWS SSM we use [summon](https://github.com/cyberark/summon) as follow:

Translations can then be updated with

```bash
summon -p ssm npm run update:translations
```

The file `secrets.yml` will tell `summon` which keys to get from AWS SSM.

### List of npm scripts

<!-- prettier-ignore -->
| command                          | what it does                                                  |
|----------------------------------|---------------------------------------------------------------|
| `npm run dev`                    | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output). |
| `npm run build`                  | Compiles all file without bundling and minification           |
| `npm run build:(dev\|int\|prod)` | Compiles all file for the according `mode`                    |
| `npm run lint`                   | Format, lints and fixes                                       |
| `npm run lint:no-fix`            | Check formatting and linting without auto fixes               |
| `npm run test:unit`              | Runs unit tests from vitest.                                  |
| `npm run test:unit:watch`        | Runs unit tests and then watch for changes, re-running any part of the tests that is edited (or tests linked to parts of the app that has changed). |
| `npm run test:e2e`               | Opens up the cypress app with a mobile sized view             |
| `npm run test:e2e:headless`      | Run cypress E2E tests in headless mode with a mobile sized view |
| `npm run test:e2e:tablet`        | Opens up the cypress app with a iPad sized view               |
| `npm run test:e2e:desktop`       | Opens up the cypress app with a 1080p sized view              |
| `npm run test:e2e:ci`            | Run cypress E2E tests on the served URL (NOTE: the server should be started before). Only tests the mobile sized view. |
| `npm run test:component`         | Opens up the cypress component tests |
| `npm run test:component:headless` | Run cypress component tests in headless mode |
| `npm run test:component:ci`      | Run cypress component tests |
| `npm run update:translations`    | Update translation files according to our Google Spreadsheet. See [above](#tooling-for-translation-update) for required tools. |

All script commands starting a webserver or using one (`dev` and all things related to cypress) will determine the port to use by looking for the next one available starting at `8080`.

### What about `package-lock.json` file?

The CI uses this file to ensure it will not stumble upon a minor version of a library that breaks the app. So this file needs to be versioned, and kept up to date (each time a new library or version of a library is added to `package.json`, `npm install` will update `package-lock.json` accordingly).

The CI will use `npm ci`, which act like `npm install` but it ignores the file `package.json` and loads all libraries versions found in `package-lock.json` (which are not volatile, e.g. `^1.0.0` or `~1.0.0.`, but fixed).

## Project deployment

The application is deployed on three targets : `dev|int|prod`

### Automatic deploy

After every successful build triggered by a merge into `develop`, a version is automatically deployed in DEV staging. After every successful build triggered by a a merge into `master`, a version is automatically deployed on INT and PROD staging.
automatically.

| environment | hostname             | path                   | branch         |
| ----------- | -------------------- | ---------------------- | -------------- |
| PR          | sys-map.dev.bgdi.ch  | /preview/<branch_name> | <bug-_/feat-_> |
| dev         | sys-map.dev.bgdi.ch  | /                      | develop        |
| int         | sys-map.int.bgdi.ch  | /                      | master         |
| prod        | sys-map.prod.bgdi.ch | /                      | master         |

The deployments are done **automatically** via the [CI for web-mapviewer](https://github.com/geoadmin/infra-terraform-bgdi-builder/tree/master/codebuild_projects/web_mapviewer#ci-for-web-mapviewer).

A test link is also added to the description of every PR automatically using [github workflow](https://github.com/geoadmin/web-mapviewer/blob/develop/.github/workflows/add-testlink-to-pr.yml).

### Manual deploy

A bash script [deploy.sh](https://github.com/geoadmin/infra-terraform-bgdi-builder/blob/master/codebuild_projects/web_mapviewer/scripts/deploy.sh)
is used for manual deploy, either from a local directory or a bucket from the CI.

```bash
./scripts/deploy.sh: --staging STAGING {--version VERSION | --local-src DIR} [--preview TEST_LINK]

Deploy web-mapviewer on the given staging. Either deploy a version from the
build-artifacts-swisstopo bucket (with --version option), or a local build version
using the --local-src DIR option.

OPTIONS:
  -h|--help               Print the help and exit.
  -s|--staging STAGING    Staging to deploy; dev|int|prod. Default; dev
  -v|--version VERSION    Version to deploy.
```

On `prod`, check [deploy on prod](https://github.com/geoadmin/infra-terraform-bgdi-builder/tree/master/codebuild_projects/web_mapviewer#deploy-on-prod) and use the script from within `infra-terraform-bgdi-builder/projects/web_mapviewer` to deploy **manually**.

> **_NOTE:_**  
> If deploying manually to `prod`, wait until the CI has finished building the project, as the deploy script only copy files.

Depending on the target (`dev|int|prod`), you will have to build and bundle/minify the app (for `int` and `prod`) or simply build the app without minification (for `dev`) prior to deplay (`npm run build:(dev|int|prod)`)

- Only `develop` branch can be deployed at the root of the `dev` bucket.
- Only `master` branch can be deployed at the root of `int` and `prod` buckets.

## Check External Layer Provider list

In the `Import` tool we provide an hardcoded list of provider via the [src/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json](./src/modules/menu/components/advancedTools/ImportCatalogue/external-providers.json) file. Because we have quite a lot of provider, we have a CLI tool in order to
check their validity. The tool can also be used with a single url as input parameter to see the url would be valid
for our application.

```bash
npm install
./scripts/check-external-layers-providers.js
```

You can use `-h` option to get more detail on the script.
