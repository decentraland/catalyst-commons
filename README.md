# catalyst-commons
Common tools and types to share between catalyst servers and clients

## Contributing

### Build and test

```
npm install
npm run build
npm run test
```

### [Releases](https://registry.npmjs.org/dcl-catalyst-commons)

#### Stable Releases
To publish a new release, a tag following [SemVer](https://semver.org/) must be done in `master` branch following the format: `MAJOR.MINOR.PATCH` and that will trigger a Github Workflow that publishes the new version of the library, tagging it as `latest`.

#### Master Releases
Every commit to `master` branch triggers a NPM Publish with the beta version following the convention `NEXT_MAJOR.NEXT_MINOR.NEXT_PATCH-TIMESTAMP.commit-COMMIT_SHA`, tagging it as `next`.

#### Tag Releases
If you need to publish a NPM package in a work in progress commit, then you can create a Github Tag, and that will trigger an automatically NPM publish following the convention `NEXT_MAJOR.NEXT_MINOR.NEXT_PATCH-TIMESTAMP.commit-COMMIT_SHA` and tagging it on NPM with your custom tag: `tag-CUSTOM_TAG`.
