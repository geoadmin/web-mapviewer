# Integration test framework

> Status: accepted

> Date: 28.05.2020

## Context

An integration test framework (and possibly a combo unit/integration test) has to be chosen for this project.
After reviewing what's the state of testing with JS in 2020, here's a list of contenders.

### Selenium

Has been the standard of the industry for many years. Start to struggle with single page application framework (SPA) like Angular, Vue.js or React.js.

- Desktop browsers, emulators / simulators and real devices (E2E testing all the way)
- Highly scalable
- Has many "sister frameworks" that enhance the feature set (like Appium for mobile testing, Nightwach or WebdriverIO)

While very efficient for E2E testing, this framework would be cumbersome to have in development on a local machine.
Could be used for E2E testing for cross browser compatibility tests.

### TestCafe

Good alternative to Selenium, is compatible with Saucelab (we already have some account with them).

- Fast to set up
- Cross Browser and Devices (with SauceLabs or BrowserStack)

This could also be a good cross browser testing framework, but the cross browser feature will be hard to have deployed on every developers' machine.

### Cypress

Made by devs for devs.

- Very convenient running and debugging tools
- Native access to all your application’s variables
- Solid and clear documentation
- Newest addition (2017) to the big frameworks (very active community)

## Decision

After playing a bit with these frameworks, Cypress clearly had something for it.

The documentation is well maintained and complete, tests are described with Mocha which is already known by many in the team (it's what we used to write our tests on the older viewer)

Cypress will be a great help during the development phase of the new viewer.
But we have to keep in mind that it doesn't really do cross browser testing.

## Consequences

We start to use Cypress as our Unit test and integration test framework.
We will decide, in the future, if it is relevant to have another framework to help us test cross browser capabilities (especially with mobile devices).

## Sources

- [This medium.com article](https://medium.com/welldone-software/an-overview-of-javascript-testing-7ce7298b9870)
- [This blog post on netguru.com](https://www.netguru.com/codestories/which-javascript-ui-testing-framework-to-use-in-2020)
