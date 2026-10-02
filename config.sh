#!/bin/bash
parent=$1
if [ -z "$parent" ]; then
  echo "Usage: $0 <Chainguard parent org domain>"
  exit 1
fi

out_json=$(chainctl auth pull-token --repository=javascript --parent="$parent" --ttl=8670h -o json)
CHAINGUARD_JAVASCRIPT_IDENTITY_ID=$(echo $out_json | jq -r '.identity_id')
CHAINGUARD_JAVASCRIPT_TOKEN=$(echo $out_json | jq -r '.token')

token=$(echo -n $CHAINGUARD_JAVASCRIPT_IDENTITY_ID:$CHAINGUARD_JAVASCRIPT_TOKEN | base64 -w 0)

npm config set registry https://libraries.cgr.dev/javascript/ --location=project
npm config set //libraries.cgr.dev/javascript/:_auth "${token}" --location=project

echo ".npmrc file updated"