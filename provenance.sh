PACKAGE=$1

NPM_VIEW_OUTPUT=$(npm view $PACKAGE dist --json)
TARBALL_URL=$(echo $NPM_VIEW_OUTPUT | jq -r '.tarball')
ATTESTATION_URL=$(echo $NPM_VIEW_OUTPUT | jq -r '.attestations.url')

echo "Tarball URL: $TARBALL_URL"
echo "Attestation URL: $ATTESTATION_URL"

# Download tarball
curl -L -H "Authorization: Bearer $(chainctl auth token --audience=libraries.cgr.dev)" \
  "$TARBALL_URL" \
  -o $PACKAGE.tgz


# Extract SLSA provenance bundle
curl -H "Authorization: Bearer $(chainctl auth token --audience=libraries.cgr.dev)" \
  "$ATTESTATION_URL" | \
  jq -c '.attestations[] | select(.predicateType | contains("slsa")) | .bundle' \
  > $PACKAGE-provenance.sigstore.json

cosign verify-blob-attestation \
  --bundle $PACKAGE-provenance.sigstore.json \
  --type slsaprovenance1 \
  --certificate-oidc-issuer=https://issuer.enforce.dev \
  --certificate-identity-regexp="^https://issuer.enforce.dev/" \
  --check-claims=false \
  $PACKAGE.tgz

cat $PACKAGE-provenance.sigstore.json | jq -r '.dsseEnvelope.payload | @base64d | fromjson'
