PACKAGE=$1

SBOM_URL=$(npm view $PACKAGE dist.sboms --json | jq -r '.spdx.url')

curl -H "Authorization: Bearer $(chainctl auth token --audience=libraries.cgr.dev)" "$SBOM_URL" | jq