# Banking App Demo

## Using our JavaScript Registry

- Show the `package.json`
- Run `npm install`
- Start app with `npm run dev`
- Navigate to `localhost:3000`
- View the `package-lock.json` and note all the dependencies from the public internet
- Run `./reset.sh`
- Generate / modify `.npmrc` file (show example)
- Run `npm install`
- Start app with `npm run dev`
- Investigate new `package-lock.json`
- Rename the `.npmrc`

## Dockerized

Let's clean up our previous thing: `./reset.sh`

### Non-Chainguard
- View `Dockerfile`

- Build the image: `docker build -t banking-app:latest .`

- Run the container: `docker run -p 3000:3000 banking-app:latest`

- Scan the image: `grype banking-app:latest -o json | jq '[.matches[].vulnerability.severity] | group_by(.) | map({severity: .[0], count: length})'`

### Chainguard Version

View the console's node base image, note how many fewer packages there are.

- Reset: `./reset.sh`

- Add .npmrc back!

- Look at the Dockerfile

- Build the image, authenticate with our Universal Repo: `DOCKER_BUILDKIT=1 docker build -f Dockerfile.cg --secret id=npmrc,src=.npmrc -t banking-app-cg:latest .`

- Run the container: `docker run -p 3000:3000 banking-app-cg:latest`

- Navigate to `localhost:3000`

- Scan the image: `grype banking-app-cg:latest -o json | jq '[.matches[].vulnerability.severity] | group_by(.) | map({severity: .[0], count: length})'`

- Bonus: Take a look at the package-lock.json: `docker run --rm -it --entrypoint /bin/sh banking-app-cg:latest`

