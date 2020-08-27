# Contributing

### Development process

This project uses a [git flow](https://nvie.com/posts/a-successful-git-branching-model/) approach.

Meaning all changes should be made through a PR to the `develop` branch.
Then a version is made by creating a `release-20xx-xx-xx` branch from `develop` and merging it to `master` after tests are green. (Test campaign TBD)

All commits on `master` thus represent a new version of the app.

### Automated git tagging of `master`

When merging on `master` (from a `release-20xx-xx-xx` branch), an automatic git tag will be added to `master` branch by [github-tag-bump](https://github.com/marketplace/actions/github-tag-bump)

This tag will be a bump in :
- major version (x.0.0) if one commit message in the PR contains the `#major` word (with the hash)
- a patch version (0.0.x) if one commit message in the PR contains the `#patch` word
- minor version (0.x.0) if none of the above is true, or if a commit message of the PR contains the word `#minor`

### Continuous integration / deployment

CI is managed by AWS CodeBuild.
- Every merge (commit) on `develop` will trigger a deploy on http://web-mapviewer.dev.bgdi.ch/ by the CI
- Every merge (commit) on `master` will trigger a deploy on https://web-mapviewer.int.bgdi.ch/ by the CI

### structure/architecture of the app

See [Project structure section in README.md](README.md#project-structure)
