import { spacetimedbSocket } from '../src/lib/spacetimedbSocket';

async function testSpacetimeDBSocket() {
  console.log('=== [TEST 1] Initial Telemetry Check ===');
  const initial = spacetimedbSocket.getTelemetry();
  console.log('Telemetry:', initial);
  if (!initial.wsUrl.includes('spacetimedb.com')) {
    throw new Error('Invalid wsUrl: ' + initial.wsUrl);
  }
  console.log('✓ Initial Telemetry Valid');

  console.log('\n=== [TEST 2] Mutex Validation & Latency (<50ms) ===');
  let receivedEvent: any = null;
  const start = performance.now();

  const unsub = spacetimedbSocket.onReducerEvent((event) => {
    receivedEvent = event;
  });

  const mutation = spacetimedbSocket.triggerMockMutation('sync_solana_event_reducer', 'Air');
  const elapsed = performance.now() - start;

  if (!receivedEvent) {
    throw new Error('Event was not dispatched!');
  }
  if (receivedEvent.reducerName !== 'sync_solana_event_reducer') {
    throw new Error(`Expected sync_solana_event_reducer, got ${receivedEvent.reducerName}`);
  }
  if (elapsed >= 50) {
    throw new Error(`Latency exceeded 50ms: ${elapsed.toFixed(2)}ms`);
  }

  console.log(`✓ Mutex triggered and received in ${elapsed.toFixed(3)}ms (< 50ms target)`);
  console.log('Dispatched Event:', receivedEvent);

  unsub();
  console.log('\n✓ ALL SPACETIMEDB SOCKET TESTS PASSED');
}

testSpacetimeDBSocket().catch((err) => {
  console.error('[TEST FAILED]', err);
  process.exit(1);
});
