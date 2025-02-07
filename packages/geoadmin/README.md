
# Stand-alone modules from geoadmin

This sub-project contains all modules from `web-mapviewer`'s code that are exported as npm packages, such as the profile popup, or the JS API entry point (to be able to add a map with Swisstopo layer without prior knowledge of OpenLayers)


## Use local build of geoadmin lib


In this folder (`src/lib/`) run
```bash
npm i
npm run build
```

This will install and build the project, then link this project to your local NPM registry (we will be able to link it to other projects, like the main web-mapviewer project).

Now go back to the root folder of the project, and run
```bash
npm link geoadmin
npm i
```

Your web-mapviewer build will now use the code found in this folder, instead of downloading it from NPM online registry. Any changes you made (and then do a `npm run build` in the `src/lib` folder) will isntantly be reflected on your locally run `web-mapviewer`
