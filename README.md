# Banking App

The purpose of this repo is to show how a developer can easily migrate to using the Chainguard Repository for JavaScript Libraries.

## Demo Flow

Reset the demo app to use public npm:
```
./reset.sh
rm .npmrc
npm install
```

Run the app:
```
npm run dev
```

Review a package in the node_modules folder. Note that there is an implicit trust that all of these packages are safe, but zero verification.

Now, configure the integration to Chainguard Libraries, mention integrating with an internal artifact repo if relevant, clear out the dependencies, and re-install. Emphasize the ease of integration.

```
chainctl auth configure-npm
./reset.sh
npm install
```

Choose a package to see SBOM and provenance attestions. `pg` is a good example to use:

```
npm show pg
./provenance.sh pg
./sbom.sh pg
```

Emphasize that you can verify that the source you are expecting matches what you actually are installing.

Use chainctl to verify _all_ packages and show coverage.

```
chainctl libs verify node_modules
```

Use the <100% coverage to call out:
- we are working toward 100% coverage
- Chainguard Repository allows you to take advantage **today** while safely consuming from upstream
- Configurable cooldown (7-day default) and check for MAL ID (known malware)

Wrap up -- what we accomplished in the demo:
- Eliminated an entire class of malware attack
- Added protections and guardrails to packages we pull from upstream npm registry
- Maintained the same developer experience and workflows

## Example Demo

See a walk through of the demo from Andrew Dean:
https://drive.google.com/file/d/1E6LL6fC0-6AZIYo_al224cjmLFN5gWob/view?usp=sharing

## Useful commands

Ensure your org has the Chainguard Repository enabled (or use an org where it is)
```
# Generate the .npmrc file
./config.sh <your org>

# Install dependencies
npm install

# Run the app
npm run dev

# Clear lock file, node modules, and local npm cache
./reset.sh
```

## Tips
Ensure that you have upstream fallback enabled on your Chainguard registry to generate the package-lock.json from `npm install`.

## Questions

If you have any questions about the demo, please reach out to Dylan Havelock and/or Andrew Dean