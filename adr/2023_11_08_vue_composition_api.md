# Vue Composition API

> Status: accepted

> Date: 08.11.2023

## Context

Vue3 is already our Vue version for a while, but we haven't yet utilized all its potential. One of them is to use the Composition API, which is a more succinct way of describing components (less boilerplate code).
Composition API should help us, in many cases, to build more reusable portions of code (replacing the mixins for instance, which is a quite confusing concept)

This, in return, gives new challenges as it doesn't force us to structure our component in the same way (props, computed, etc...) through the linter.

## Decision

We will now be using the Composition API for new components, and transform Option API components into Composition API when extensive work is required on them

## Consequences

- New components should be written with the Composition API
  - `<script setup>` tag should be the first tag of the `.vue` file (instead of `<template>`, that's the new best practice with this approach)
  - declares things in this order in the `<script setup>` tag
    - imports
    - props (input)
    - store link (input)
    - computed (transformation of inputs)
    - life-cycle hooks (mounted and such)
    - interaction with the user (was called `methods` in the OptionAPI)
- Components that are extensively edited should be rewritten using the Composition API
