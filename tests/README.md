# Testing

- [Unit testing](#unit-testing)
- [E2E testing](#e2e-testing)
  - [Cypress Cloud](#cypress-cloud)
    - [Component Testing on Cloud](#component-testing-on-cloud)
  - [Using cypress on a Windows machine](#using-cypress-on-a-windows-machine)
    - [Source code in WSL2 file system](#source-code-in-wsl2-file-system)
  - [Using cypress on a Unix machine](#using-cypress-on-a-unix-machine)
- [CI](#ci)

## Unit testing

This project uses [vitest](https://vitest.dev/) which is the default used by Vue3. Unit tests files are directly
located next to the source code that is tested. By definition we put all unit testings files in a subdirectory
name `__tests__`. Vitest search for test files using the following pattern: `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`.

To run unit tests, execute `npm run test:unit`.

## E2E testing

This project uses [Cypress.io](https://www.cypress.io/) for E2E tests. All things related to tests are in the folder `/tests/cypress/tests-e2e`.

There are two ways of executing E2E tests, either with a UI feedback using `npm run test:e2e` (which will open the Cypress GUI, you can then choose which test to run), or by running all E2E test headless with `npm run test:e2e:ci`.

### Cypress Cloud

On the CI the tests are run in parallel using Cypress Cloud, see [web-mapviewer cypress cloud project](https://cloud.cypress.io/projects/fj2ezv/runs).

You can also record your local run of cypress to the cloud as follow

```bash
npm run start &

summon npx cypress run --record --tag local [--spec tests/cypress/tests-e2e/SPECFILE]
```

:warning: The cypress cloud project is public !

#### Component Testing on Cloud

To run the cypress component tests on the cloud enter

```bash
summon npx cypress run --component --browser chrome --record --tag local
```

:memo: Only `chrome` browser supports proper replay on the cloud.

:warning: The cypress cloud project is public !

### Using cypress on a Windows machine

To use Cypress on Windows, it is required to go through the Windows Linux Subsystem (WLS) and more specifically WSL2 (here's [Microsoft's install guide](https://docs.microsoft.com/en-us/windows/wsl/install-win10))

In order to see Cypress' window, we will need an XServer client running on Windows that can show Linux's window. Here's a [guide that tells you exactly how to do that](https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress).
Other resources :

- [a Microsoft guide](https://techcommunity.microsoft.com/t5/windows-dev-appconsult/running-wsl-gui-apps-on-windows-10/ba-p/1493242) on how to show Linux's windows in Win10.
- [a markdown file on Github](https://github.com/QMonkey/wsl-tutorial/blob/master/README.wsl2.md) explaining the same thing.

#### Source code in WSL2 file system

Be mindful that if you want to develop locally (through `npm run serve`) and also do E2E testing locally, you should host your code directly on the WSL2 file system. Otherwise `npm run serve` will not detect code changes (through WSL2 and Win file system) and your dev experience will be really degraded (having to restart `npm run serve` after each change made to the code).

It is possible to use VSCode like [this one](https://code.visualstudio.com/docs/remote/wsl) or if using another IDE, you could simply mount your WSL2 file system as a Drive (and then access your code through `Z:\...`)

### Using cypress on a Unix machine

Follow the [Cypress install guide](https://docs.cypress.io/guides/getting-started/installing-cypress.html#System-requirements)

## CI

The CI will run both test types by executing `npm run test:ci` (E2E tests will be run in headless)
