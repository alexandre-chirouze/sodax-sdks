import { describe, expect, it } from 'vitest';
import { ChainKeys } from './chains.js';
import {
  SodaTokens,
  arbitrumSupportedTokens,
  baseSupportedTokens,
  bscSupportedTokens,
  ethereumSupportedTokens,
  robinhoodSupportedTokens,
  solanaSupportedTokens,
  suiSupportedTokens,
  type XToken,
} from './tokens.js';
import { swapSupportedTokens, stagingSwapSupportedTokens } from '../swap/swap.js';
import { moneyMarketSupportedTokens, moneyMarketReserveAssets } from '../moneyMarket/moneyMarket.js';

const DIRECT_HUB_TOKENS = [
  arbitrumSupportedTokens.CHIP,
  arbitrumSupportedTokens.RAIN,
  baseSupportedTokens.AAVE,
  baseSupportedTokens.VVV,
  baseSupportedTokens.ZEN,
  bscSupportedTokens.FF,
  bscSupportedTokens.PENDLE,
  bscSupportedTokens.STABLE,
  bscSupportedTokens.TUSD,
  bscSupportedTokens.U,
  ethereumSupportedTokens.AUSD,
  ethereumSupportedTokens.CRV,
  ethereumSupportedTokens.EURC,
  ethereumSupportedTokens.ICP,
  ethereumSupportedTokens.ONDO,
  ethereumSupportedTokens.QNT,
  ethereumSupportedTokens.wM,
  ethereumSupportedTokens.wTAO,
  robinhoodSupportedTokens.AI,
  robinhoodSupportedTokens.CASHCAT,
  robinhoodSupportedTokens.TAO,
  solanaSupportedTokens['2Z'],
  solanaSupportedTokens.ANSEM,
  solanaSupportedTokens.BP,
  solanaSupportedTokens.CARDS,
  solanaSupportedTokens.CASH,
  solanaSupportedTokens.Fartcoin,
  solanaSupportedTokens.GLDx,
  solanaSupportedTokens.HOODx,
  solanaSupportedTokens.hyUSD,
  solanaSupportedTokens.KMNO,
  solanaSupportedTokens.MET,
  solanaSupportedTokens.ONYC,
  solanaSupportedTokens.PENGU,
  solanaSupportedTokens.PRIME,
  solanaSupportedTokens.SPCXx,
  solanaSupportedTokens.STONK,
  solanaSupportedTokens.syrupUSDC,
  solanaSupportedTokens.TRUMP,
  solanaSupportedTokens.USX,
  suiSupportedTokens.USDY,
] satisfies readonly XToken[];

const VAULT_LINKED_TOKENS = [
  { token: baseSupportedTokens.JitoSOL, vault: SodaTokens.sodaJITOSOL },
  { token: baseSupportedTokens.SOL, vault: SodaTokens.sodaSOL },
  { token: ethereumSupportedTokens.cirBTC, vault: SodaTokens.sodaBTC },
  { token: ethereumSupportedTokens.kBTC, vault: SodaTokens.sodaBTC },
  { token: ethereumSupportedTokens.NEAR, vault: SodaTokens.sodaNEAR },
  { token: ethereumSupportedTokens.SOL, vault: SodaTokens.sodaSOL },
  { token: ethereumSupportedTokens.tBTC, vault: SodaTokens.sodaBTC },
  { token: solanaSupportedTokens.HYPE, vault: SodaTokens.sodaHYPE },
  { token: solanaSupportedTokens.LBTC, vault: SodaTokens.sodaBTC },
  { token: solanaSupportedTokens.xBTC, vault: SodaTokens.sodaBTC },
  { token: solanaSupportedTokens.ZEC, vault: SodaTokens.sodaZEC },
] satisfies readonly { token: XToken; vault: XToken }[];

const STAGING_ADDITIONS = [
  ...DIRECT_HUB_TOKENS,
  ...VAULT_LINKED_TOKENS.map(({ token }) => token),
  SodaTokens.sodaADA,
] satisfies readonly XToken[];

describe('staging swap asset mappings', () => {
  it.each(DIRECT_HUB_TOKENS)('$symbol on $chainKey uses its hub asset without a separate vault', token => {
    expect(token.vault).toBe(token.hubAsset);
  });

  it.each(VAULT_LINKED_TOKENS)('$token.symbol on $token.chainKey points to $vault.symbol', ({ token, vault }) => {
    expect(token.vault).toBe(vault.address);
  });
});

describe('staging swap asset membership', () => {
  it.each(STAGING_ADDITIONS)('$symbol on $chainKey is enabled only for staging swaps', token => {
    expect(stagingSwapSupportedTokens[token.chainKey]).toContain(token);
    expect(swapSupportedTokens[token.chainKey]).not.toContainEqual(token);
    expect(moneyMarketSupportedTokens[token.chainKey]).not.toContainEqual(token);
  });
});

describe('new canonical hub vaults', () => {
  it.each([
    SodaTokens.sodaADA,
    SodaTokens.sodaZEC,
  ])('$symbol is a Sonic vault without a money-market reserve', token => {
    expect(token.chainKey).toBe(ChainKeys.SONIC_MAINNET);
    expect(token.decimals).toBe(18);
    expect(token.address).toBe(token.hubAsset);
    expect(token.vault).toBe(token.address);
    expect(moneyMarketReserveAssets).not.toContain(token.address);
  });

  it('registers sodaZEC for spoke mappings without enabling the vault itself for swaps or lending', () => {
    const token = SodaTokens.sodaZEC;
    expect(stagingSwapSupportedTokens[token.chainKey]).not.toContainEqual(token);
    expect(swapSupportedTokens[token.chainKey]).not.toContainEqual(token);
    expect(moneyMarketSupportedTokens[token.chainKey]).not.toContainEqual(token);
  });
});
