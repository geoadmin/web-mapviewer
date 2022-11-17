# Contributing

## Development process

This project uses a [git flow](https://nvie.com/posts/a-successful-git-branching-model/) approach.
Meaning all changes should be made through a PR to the `develop` branch.

It uses the [SemVer 2.0](https://semver.org/) versioning scheme, which is automatically handled by
a [github action script](#automated-git-tagging-of-develop-and-master). Each PR merged into `develop` creates a new beta version. While a version
is made by creating a PR to merge `develop` into `master` after tests are green (Test campaign TBD).
All commits on `master` thus represent a new version of the app.

## Linting

This project uses ESLint as the main linter, and uses presets from [https://prettier.io/](https://prettier.io/)
Lint is enforced at each build, and will result in an error if something is wrong. You can auto lint
your code by running `npm run lint` (this will lint the whole `src/` folder)

### Integration in IDE

As we are using ESLint out of the box, most modern IDE will read ESLint config file `.eslintrc.js`
and incorporate it to the environment. It is advised to deactivate code generation (or fix it in the
settings) for code parts that are not compliant with our linting policy (lambda declaration, auto
semi-column, etc...).

### Automated git tagging of `develop` and `master`

When merging on `master` (from a `develop` branch), an automatic git tag will be added to
`master` branch by [github-tag-bump](https://github.com/marketplace/actions/github-tag-bump)

This tag will be a bump in :

- major version (vx.0.0) if one commit message in the PR contains the `#major` word (with the hash)
- a patch version (v0.0.x) if one commit message in the PR contains the `#patch` word
- minor version (v0.x.0) if none of the above is true and merge is on `master`, or if a commit message of the PR contains the word `#minor`
- beta version (v0.0.0-beta.x) if none of the above is true

### Continuous integration / deployment

CI is managed by AWS CodeBuild.

- Every merge (commit) on `develop` will trigger a deploy on https://sys-map.dev.bgdi.ch/ by the CI
- Every merge (commit) on `master` will trigger a deploy on https://sys-map.int.bgdi.ch/ by the CI

### structure/architecture of the app

See [Project structure section in README.md](README.md#project-structure)
