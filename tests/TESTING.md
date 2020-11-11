# Testing

## Unit testing

This projected uses [@vue/cli-plugin-unit-mocha](https://cli.vuejs.org/core-plugins/unit-mocha.html) (and not Jest, because Cypress also uses mocha). All things related to unit testing are in the folder `/tests/unit/`.

To run unit tests, execute `npm run test:unit`.

## E2E testing

This project uses [Cypress.io](https://www.cypress.io/) for E2E tests. All things related to tests are in the folder `/tests/e2e/`.

There are two ways of executing E2E tests, either with a UI feedback using `npm run test:e2e` (which will open the Cypress GUI, you can then choose which test to run), or by running all E2E test headless with `npm run test:e2e-headless`.

### Using cypress on a Windows machine

To use Cypress on Windows, it is required to go through the Windows Linux Subsystem (WLS) and more specifically WSL2 (here's [Microsoft's install guide](https://docs.microsoft.com/en-us/windows/wsl/install-win10))

In order to see Cypress' window, we will need an XServer client running on Windows that can show Linux's window. Here's a [guide that tells you exacly how to do that](https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress).
Other resources :
- [a Microsoft guide](https://techcommunity.microsoft.com/t5/windows-dev-appconsult/running-wsl-gui-apps-on-windows-10/ba-p/1493242) on how to show Linux's windows in Win10.
- [a markdown file on Github](https://github.com/QMonkey/wsl-tutorial/blob/master/README.wsl2.md) explaining the same thing.

#### Source code in WSL2 file system

Be mindful that if you want to develop locally (through `npm run serve`) and also do E2E testing locally, you should host your code directly on the WSL2 file system. Otherwise `npm run serve` will not detect code changes (through WSL2 and Win file system) and your dev experience will be really degraded (having to restart `npm run serve` after each change made to the code).

It is possible to use VSCode like [this one](https://code.visualstudio.com/docs/remote/wsl) or if using another IDE, you could simply mount your WSL2 file system as a Drive (and then access your code through `Z:\...`)

### Using cypress on a Unix machine

Follow the [Cypress install guide](https://docs.cypress.io/guides/getting-started/installing-cypress.html#System-requirements)

### Folder structure

We leverage the [Vue E2E Cypress integration](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-e2e-cypress#readme), so Vue is managing most of what Cypress needs.
Specs (test files) are located in `/tests/e2e/specs/` and it is possible to write some commands (helper function) in `/tests/e2e/support/commands.js`.

## CI

The CI will run both test types by executing `npm run test:ci` (E2E tests will be run headless)
