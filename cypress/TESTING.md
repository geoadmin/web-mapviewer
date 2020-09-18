# Testing

This project uses [Cypress.io](https://www.cypress.io/) for Unit testing and integration tests. All things related to tests are in the folder `/cypress`.

## Using cypress on a Windows machine

To use this testing library on Windows, it is required to go through the Windows Linux Subsystem (WLS) and more specifically WSL2 (here's [Microsoft's install guide](https://docs.microsoft.com/en-us/windows/wsl/install-win10))

In order to see Cypress' window, we will need an XServer client running on Windows that can show Linux's window. Here's a [guide that tells you exacly how to do that](https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress).
Other resources :
- [a Microsoft guide](https://techcommunity.microsoft.com/t5/windows-dev-appconsult/running-wsl-gui-apps-on-windows-10/ba-p/1493242) on how to show Linux's windows in Win10.
- [a markdown file on Github](https://github.com/QMonkey/wsl-tutorial/blob/master/README.wsl2.md) explaining the same thing.

## Using cypress on a Unix machine

Follow the [Cypress install guide](https://docs.cypress.io/guides/getting-started/installing-cypress.html#System-requirements)

## Folder structure

As described [here in Cypress' doc](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Folder-Structure), here's the structure of this folder
