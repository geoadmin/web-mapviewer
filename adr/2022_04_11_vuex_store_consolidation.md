# Vuex store consolidation

> Status: accepted

> Date: 11.04.2022

## Context

The project started with a fragemented store. The main store was itself treated like the modules that contain the components. Some of those in turn contained store modules for their state.

The idea was to encapsulate each part of the application as much as possible to allow for a later externalization. But, with an intertwined application like a map viewer where much of the state is shared anyway this form of modularization doesn't bring much benefit while making it harder for a developer to find something in the store.

Consequently, most store modules are already shared and only a few remain distributed among the components.

## Decision

To make it easier to work with the store we decided to consolidate the store on the top-level of the `src` directory.

## Consequences

With this change all the state is in one place which makes it much easier to navigate the store.

Having all store modules in one directory encourages to split the store according to the content and not the consuming components. But, it allows for both.

A consolidated store makes it harder to externalize modules later but this is mostly perception as the code was already interdependant before the structural change.
