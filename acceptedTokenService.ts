import { AcceptedTokenRepository } from '../repositories/acceptedTokenRepository';
import { AcceptedToken } from '../models/AcceptedToken';
import { ChainId, Token } from '@uniswap/sdk-core';
import { getSigner, poolConstants } from '../helpers/ethersHelper';
import { TransactionRepository } from '../repositories/transactionRepository';
import { getRange } from '../helpers/functionsHelper';

export class AcceptedTokenService {
  private acceptedTokenRepository: AcceptedTokenRepository;

  constructor() {
    this.acceptedTokenRepository = new AcceptedTokenRepository();
  }

  async create(
    name: string,
    symbol: string,
    address: string,
    decimals: number,
    poolAddress: string,
    poolName: string,
    poolSymbol: string,
    poolDecimals: number
  ): Promise<void> {
    try {
      const tokenData = await this.acceptedTokenRepository.findByAddress(address);

      if (tokenData) {
        throw 'This symbol already exists';
      }

      const acceptedToken: AcceptedToken = {
        id: 0,
        name: name,
        symbol: symbol,
        address: address,
        decimals: decimals,
        pool_address: poolAddress,
        pool_name: poolName,
        pool_symbol: poolSymbol,
        pool_decimals: poolDecimals,
        active: true
      };

      const tokenA = new Token(ChainId.POLYGON, address, decimals, symbol, name);
      const tokenB = new Token(ChainId.POLYGON, poolAddress, poolDecimals, poolSymbol, poolName);

      const randomId = await getRange(1, 100);
      const randomTx = await new TransactionRepository().find(randomId);

      const signer = await getSigner(randomTx.new_wallet_private_key!);
      await poolConstants(signer, tokenA, tokenB);

      await this.acceptedTokenRepository.create(acceptedToken);
    } catch (error) {
      throw error;
    }
  }

  async edit(
    id: number,
    name: string,
    symbol: string,
    address: string,
    decimals: number,
    poolAddress: string,
    poolName: string,
    poolSymbol: string,
    poolDecimals: number
  ): Promise<void> {
    try {
      const tokenData = await this.acceptedTokenRepository.findById(id);

      if (!tokenData) {
        throw 'Symbol not find';
      }

      const acceptedToken: AcceptedToken = {
        id: tokenData.id,
        name: name,
        symbol: symbol,
        address: address,
        decimals: decimals,
        pool_address: poolAddress,
        pool_name: poolName,
        pool_symbol: poolSymbol,
        pool_decimals: poolDecimals,
        active: tokenData.active
      };

      await this.acceptedTokenRepository.update(acceptedToken);
    } catch (error) {
      throw error;
    }
  }

  async changeActive(id: number) {
    const tokenData = await this.acceptedTokenRepository.findById(id);

    if (!tokenData) {
      throw 'Symbol not find';
    }

    const active = !tokenData.active;

    await this.acceptedTokenRepository.changeActive(tokenData.id, active);

    if (!active) {
      return 'inactivated';
    }

    return 'activated';
  }

  async list() {
    const listTokens = await this.acceptedTokenRepository.list();

    return listTokens;
  }
}