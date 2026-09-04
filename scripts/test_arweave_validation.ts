import { fetchAndValidateArweaveMetadata } from '../src/lib/arweaveValidator';
import { ARWEAVE_ELEMENTAL_MANIFESTS } from '../src/data/arweaveManifests';

async function testArweave() {
  console.log('[TEST] Starting Arweave Metadata Schema Verification (Milestone M1)...');

  const uris = Object.keys(ARWEAVE_ELEMENTAL_MANIFESTS);
  let allValid = true;

  for (const uri of uris) {
    const res = await fetchAndValidateArweaveMetadata(uri);
    console.log(`[VERIFY] Element: ${res.manifest?.symbol} (${res.element})`);
    console.log(`         URI: ${res.uri}`);
    console.log(`         Status: ${res.statusCode} (valid: ${res.valid})`);
    console.log(`         SHA-256 Digest: ${res.sha256}`);
    console.log(`         Attributes Count: ${res.manifest?.attributes.length}`);
    if (!res.valid || res.statusCode !== 200 || !res.sha256) {
      allValid = false;
      console.error(`[FAIL] ${uri} validation errors:`, res.errors);
    }
  }

  if (allValid) {
    console.log('\n[PASS] Milestone M1 PASSED: All 4 elemental metadata schemas verified with HTTP 200 and SHA-256 digests.');
  } else {
    console.error('\n[FAIL] Milestone M1 FAILED.');
    process.exit(1);
  }
}

testArweave().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
