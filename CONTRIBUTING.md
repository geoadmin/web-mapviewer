# Contributing

## Table of content

- [Contributing](#contributing)
  - [Development process](#development-process)
    - [Automated git tagging of `develop` and `master`](#automated-git-tagging-of-develop-and-master)
  - [NPM](#npm)
    - [list of npm targets](#list-of-npm-targets)
    - [What about `package-lock.json` file?](#what-about-package-lockjson-file)
  - [Linting](#linting)
    - [Integration in IDE](#integration-in-ide)
  - [Continuous integration / deployment](#continuous-integration--deployment)
  - [Project structure](#project-structure)
    - [Best practices](#best-practices)
    - [Vue Composition API](#vue-composition-api)
    - [Store module](#store-module)
  - [Testing](#testing)
  - [Environment variables](#environment-variables)
  - [Tooling to update translation](#tooling-to-update-translation)
  - [Project deployment](#project-deployment)
    - [Automatic deploy](#automatic-deploy)
    - [Manual deploy](#manual-deploy)

## Development process

This project uses a [git flow](https://nvie.com/posts/a-successful-git-branching-model/) approach.
Meaning all changes should be made through a PR to the `develop` branch.

It uses the [SemVer 2.0](https://semver.org/) versioning scheme, which is automatically handled by
a [github action script](#automated-git-tagging-of-develop-and-master). Each PR merged into `develop` creates a new beta version. While a version
is made by creating a PR to merge `develop` into `master` after tests are green (Test campaign TBD).
All commits on `master` thus represent a new version of the app.

### Automated git tagging of `develop` and `master`

When merging on `master` (from a `develop` branch), an automatic git tag will be added to
`master` branch by [github-tag-bump](https://github.com/marketplace/actions/github-tag-bump)

This tag will be a bump in :

- major version (vx.0.0) if one commit message in the PR contains the `#major` word (with the hash)
- a patch version (v0.0.x) if one commit message in the PR contains the `#patch` word
- minor version (v0.x.0) if none of the above is true and merge is on `master`, or if a commit message of the PR contains the word `#minor`
- beta version (v0.0.0-beta.x) if none of the above is true

## NPM

### list of npm targets

| command                           | what it does                                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Compiles and hot-reloads for development. Will serve the project under `http://localhost:8080` (or the next available port if `8080` is already used, see console output). |
| `npm run build`                   | Compiles all file without bundling and minification                                                                                                                        |
| `npm run build:(dev\|int\|prod)`  | Compiles all file for the according `mode`                                                                                                                                 |
| `npm run lint`                    | Format, lints and fixes                                                                                                                                                    |
| `npm run lint:no-fix`             | Check formatting and linting without auto fixes                                                                                                                            |
| `npm run test:unit`               | Runs unit tests from vitest.                                                                                                                                               |
| `npm run test:unit:watch`         | Runs unit tests and then watch for changes, re-running any part of the tests that is edited (or tests linked to parts of the app that has changed).                        |
| `npm run test:e2e`                | Opens up the cypress app with a mobile sized view                                                                                                                          |
| `npm run test:e2e:headless`       | Run cypress E2E tests in headless mode with a mobile sized view                                                                                                            |
| `npm run test:e2e:tablet`         | Opens up the cypress app with a iPad sized view                                                                                                                            |
| `npm run test:e2e:desktop`        | Opens up the cypress app with a 1080p sized view                                                                                                                           |
| `npm run test:e2e:ci`             | Run cypress E2E tests on the served URL (NOTE: the server should be started before). Only tests the mobile sized view.                                                     |
| `npm run test:component`          | Opens up the cypress component tests                                                                                                                                       |
| `npm run test:component:headless` | Run cypress component tests in headless mode                                                                                                                               |
| `npm run test:component:ci`       | Run cypress component tests                                                                                                                                                |
| `npm run update:translations`     | Update translation files according to our Google Spreadsheet. See [above](#tooling-for-translation-update) for required tools.                                             |

All scripts commands starting a webserver or using one (`dev` and all things related to cypress) will determine the port to use by looking for the next one available starting at `8080`.

### What about `package-lock.json` file?

The CI uses this file to ensure it will not stumble upon a minor version of a library that breaks the app. So this file needs to be versioned, and kept up to date (each time a new library or version of a library is added to `package.json`, `npm install` will update `package-lock.json` accordingly).

The CI will use `npm ci`, which act like `npm install` but it ignores the file `package.json` and loads all libraries versions found in `package-lock.json` (which are not volatile, e.g. `^1.0.0` or `~1.0.0.`, but fixed).

## Linting

This project uses ESLint as the main linter, and uses presets from [https://prettier.io/](https://prettier.io/)
Lint is enforced at each build, and will result in an error if something is wrong. You can auto lint
your code by running `npm run lint` (this will lint the whole `src/` folder)

### Integration in IDE

As we are using ESLint out of the box, most modern IDE will read ESLint config file `eslint.config.mjs`
and incorporate it to the environment. It is advised to deactivate code generation (or fix it in the
settings) for code parts that are not compliant with our linting policy (lambda declaration, auto
semi-column, etc...).

## Continuous integration / deployment

CI is managed by AWS CodeBuild.

- Every merge (commit) on `develop` will trigger a deploy on <https://sys-map.dev.bgdi.ch/> by the CI
- Every merge (commit) on `master` will trigger a deploy on <https://sys-map.int.bgdi.ch/> by the CI

## Project structure

This is a [Vue](https://vuejs.org/) app that is served through `src/main.js`, using [Vuex](https://vuex.vuejs.org/) as a state manager.

The app is divided into packages (or modules) that are stored into `packages/`. The goal is for each of these modules to be able to be externalized if needed.
They are using NPM workspaces to be linked together, making this repo a sort of monorepo.

To make the code easier to navigate and maintain, we consolidated the complete state of the viewer in one place (`packages/mapviewer/src/store/`).
The store is divided into modules that mostly correspond to the application parts but also include modules for state that is used by multiple parts of the app or would be too big for a single file.
The goal is to have a centralized way of dealing with changes, and not delegate that to each component.

Store plugins can be used to react to store changes.
See the [store read-me](packages/mapviewer/src/store/README.md) for more information.

### Best practices

- Prefer primitive data or javascript plain object in reactive data (Vue Component data or refs, Vuex store data)
- Don't use a complex object as reactive data
- Avoid using JavaScript getter and setter in class that are used in reactive data

See also [Store Best Practices](./packages/mapviewer/src/store/README.md#best-practices)

### Vue Composition API

New components should be written using the Vue Composition API.

The structure of the file should be :

- `<script setup>` tag should be the first tag of the `.vue` file (instead of `<template>`, that's the new best practice with this approach)
- declares things in this order in the `<script setup>` tag
  1. imports
  2. props (input)
  3. data
  4. store mapping (input)
  5. computed (transformation of inputs)
  6. watchs
  7. life-cycle hooks (mounted and such)
  8. interaction with the user (was called `methods` in the OptionAPI)

```vue
<script setup>
// 1. First put the imports
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

// 2. Put all the props (input)
const { myProp } = defineProps({
  myProp: {
    type: Boolean,
    default: false,
  },
})

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

## Testing

Unit testing is done through the VueCLI unit test helper, and integration testing is done with Cypress.io.
All things related to tests are in each packages `/tests` folder.
See [README.md](./tests/README.md) for more documentation on testing in this project.

## Environment variables

Environment variables are defined in the following files

- .env.development
- .env.integration
- .env.prodcution

The first one is used by `npm run dev` as well as for all `development` modes. The second is used to build for and deploy to our integration server. Otherwise `.env.production` is used by default.
For more information about loading environment variables see [Vue - Modes and Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html#modes-and-environment-variables)

## Tooling to update translation

Our translation master is hosted in a Google Spreadsheet, thus if you want to update translations you will need a valid Google API Key.
One can be found in our AWS SSM store in `swisstopo-bgdi-builder` account.

In order to easily access the google API key stored in AWS SSM we use [summon](https://github.com/cyberark/summon) as follow:

Translations can then be updated with

```bash
summon -p ssm npm run update:translations
```

The file `secrets.yml` will tell `summon` which keys to get from AWS SSM.

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
