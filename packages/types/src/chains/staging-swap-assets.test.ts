import { describe, expect, it } from 'vitest';
import { ChainKeys, type SpokeChainKey } from './chains.js';
import { SodaTokens, supportedTokensByChain, type XToken } from './tokens.js';
import { getStagingSolverTokens, swapSupportedTokens, stagingSwapSupportedTokens } from '../swap/swap.js';
import { moneyMarketSupportedTokens, moneyMarketReserveAssets } from '../moneyMarket/moneyMarket.js';

const additions: Partial<Record<SpokeChainKey, readonly string[]>> = {
  [ChainKeys.ARBITRUM_MAINNET]: ['CHIP', 'RAIN'],
  [ChainKeys.BASE_MAINNET]: ['AAVE', 'JitoSOL', 'SOL', 'VVV', 'ZEN'],
  [ChainKeys.BSC_MAINNET]: ['FF', 'PENDLE', 'STABLE', 'TUSD', 'U'],
  [ChainKeys.ETHEREUM_MAINNET]: [
    'AUSD',
    'cirBTC',
    'CRV',
    'EURC',
    'ICP',
    'kBTC',
    'NEAR',
    'ONDO',
    'QNT',
    'SOL',
    'tBTC',
    'wM',
    'wTAO',
  ],
  [ChainKeys.ROBINHOOD_MAINNET]: ['AI', 'CASHCAT', 'TAO'],
  [ChainKeys.SOLANA_MAINNET]: [
    '2Z',
    'ANSEM',
    'BP',
    'CARDS',
    'CASH',
    'Fartcoin',
    'GLDx',
    'HOODx',
    'HYPE',
    'hyUSD',
    'KMNO',
    'LBTC',
    'MET',
    'ONYC',
    'PENGU',
    'PRIME',
    'SPCXx',
    'STONK',
    'syrupUSDC',
    'TRUMP',
    'USX',
    'xBTC',
    'ZEC',
  ],
  [ChainKeys.SONIC_MAINNET]: ['sodaADA'],
  [ChainKeys.SUI_MAINNET]: ['USDY'],
};

const identity = (token: XToken): string =>
  token.address.startsWith('0x') && !token.address.includes('::') ? token.address.toLowerCase() : token.address;

describe('staging swap asset additions', () => {
  for (const [chain, symbols] of Object.entries(additions)) {
    it(`registers each addition only in staging swaps on ${chain}`, () => {
      const chainKey = Object.values(ChainKeys).find(key => key === chain);
      if (!chainKey) throw new Error(`Unknown chain ${chain}`);
      const registry: readonly XToken[] = Object.values(supportedTokensByChain[chainKey]);
      for (const symbol of symbols) {
        const matches = registry.filter(token => token.symbol === symbol);
        expect(matches).toHaveLength(1);
        const token = matches[0];
        if (!token) throw new Error(`Missing ${symbol} on ${chain}`);
        expect(token.chainKey).toBe(chainKey);
        expect(stagingSwapSupportedTokens[chainKey]).toContain(token);
        expect(getStagingSolverTokens(chainKey)).toContain(token);
        expect(swapSupportedTokens[chainKey].map(identity)).not.toContain(identity(token));
        expect(moneyMarketSupportedTokens[chainKey].map(identity)).not.toContain(identity(token));
      }
    });
  }

  it('registers the new vaults without enabling money-market reserves', () => {
    for (const token of [SodaTokens.sodaADA, SodaTokens.sodaZEC]) {
      expect(token.chainKey).toBe(ChainKeys.SONIC_MAINNET);
      expect(token.decimals).toBe(18);
      expect(token.address).toBe(token.hubAsset);
      expect(token.vault).toBe(token.hubAsset);
      expect(moneyMarketReserveAssets.map(address => address.toLowerCase())).not.toContain(token.address);
    }
    expect(getStagingSolverTokens(ChainKeys.SONIC_MAINNET)).not.toContain(SodaTokens.sodaZEC);
  });
});
