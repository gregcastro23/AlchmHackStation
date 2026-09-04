export type HackathonTrack = 'from-scratch' | 'extend-open-source' | 'ship-a-feature';

export interface HackStationMissionConfig {
  protocol: 'AlchmAgentsSolana';
  ecosystem: 'Pentacles';
  database: 'SpaceTimeDB';
  network: 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet';
  tokenProgram: 'Token-2022' | 'SPL-Token';
}
