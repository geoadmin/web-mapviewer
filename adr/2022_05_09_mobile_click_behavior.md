# Mobile click behavior

> Status: accepted

> Date: 06.07.2022

## Context

Currently, a short click will switch the app in fullscreen mode. A long click (with a release of the click) will run an identify (like a click on desktop)

The issue is that there is no location popup possibilities with that (or at least it's unwanted if it pops up after a long click). We need to rework that.

## Decision

- Mobile layout (menu must be opened through header button)
  - Single touch (click) : identify, if no feature found, fullscreen toggle
  - Long touch : location popup
- Desktop layout (menu always open)
  - Single click : identify (no fullscreen toggle)
  - Long click : nothing
  - Right click : location popup

## Consequences

This would allow mobile users to use all the features we provide (identify, location) while keeping the fullscreen possibility.

## Links

- [JIRA ticket this ADR is based on](https://jira.swisstopo.ch/browse/BGDIINF_SB-2235)
- [JIRA ticket where this became a problem](https://jira.swisstopo.ch/browse/BGDIINF_SB-2323)
