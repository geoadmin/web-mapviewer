# Modularization of the project

> Status: accepted

> Date: 27.01.2025

> Author: Pascal Barth, Stefan Heinemann, Stefan Biegler, Jürgen Hansmann

## Context

We want to re-use part of this project to help us build the new product we are planning with geocat.ch, geodienste.ch and kgk-cgc.ch

There is also the idea to replace our outdated JS API (https://api3.geo.admin.ch/api/doc.html)

There is a need to have re-usable components, such as a map component, or helpers to transform our layer definition into OpenLayers equivalent (with the correct LV95 config, etc...)

## Descision

It was decided to split this project into multiple "modules" that can then be published on NPM as stand-alone packages.

That means transforming this project into a monorepo, and making it possible to develop the "npm package" sides of the project alongside the webapp (and have hot-reload capabilities)
