import type {
  ConsensusGaugeViewModel,
  ElementName,
  EsmsName,
} from "@/lib/astrologyMath";

export interface CoreIdentity {
  id: string;
  email: string;
  handle: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
  role: string;
}

export interface Web3GamingIdentity {
  spacetimeIdentity?: string | null;
  solanaPubkey?: string | null;
  evmAddress?: string | null;
  faction?: string | null;
  deckSeed?: string | number | null;
  tokens: number;
  wordWins: number;
  isWalletBound: boolean;
}

export interface AstrologicalMatrix {
  birthData?: {
    dateTime?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    locationName?: string;
  } | null;
  houseSystem: string;
  ascendantDeg?: number;
  dominantElement: ElementName;
  dominantEsms: EsmsName;
  chartRulerName: string;
  isFixture: boolean;
  gaugeViewModel: ConsensusGaugeViewModel;
}

export interface AgenticIntelligence {
  monicaConstant?: number | null;
  primaryAgent?: {
    id: string;
    name: string;
    level: number;
    consciousnessStage: string;
    mood?: string;
    avatarUrl?: string | null;
  } | null;
}

export interface CulinaryEconomy {
  dietaryPreferences: {
    restrictions: string[];
    cuisines: string[];
    spiceLevel: string;
  };
  cartIntentsCount: number;
  tokenBalances: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
  isPremium: boolean;
  streakCount: number;
  lastDailyClaimAt?: string | null;
}

export interface SyncStatus {
  hasKitchenData: boolean;
  hasAgentsData: boolean;
  hasPentaclesData: boolean;
  lastSyncedAt: string;
}

export interface UserConsensus {
  core: CoreIdentity;
  web3: Web3GamingIdentity;
  astrology: AstrologicalMatrix;
  agents: AgenticIntelligence;
  culinary: CulinaryEconomy;
  sync: SyncStatus;
}
