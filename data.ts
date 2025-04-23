import BlockchainHelper from "../helpers/blockchainHelper";
import { BigNumberish, ethers } from "ethers";

function formatDecimal(rawNumber: BigNumberish) {
  return Number((
    ethers.formatUnits(
      rawNumber,
      18
    )
  ))
}

function getDecimalPart(value: BigNumberish, decimals?: number, decimalsFormat?: number): number {
  try {

    return Number(
      parseFloat(ethers.formatUnits(value, decimalsFormat ? decimalsFormat : 18)).toFixed(
        decimals ? decimals : 2
      )
    );
  } catch (e) {
    return Number(value)
  }
}

async function getTimestampOnChain() {
  try {
    const blockchainHelper = new BlockchainHelper();
    const provider = blockchainHelper.getProvider();
    const blockNumber = await provider.getBlockNumber()
    const timestamp = (await provider.getBlock(blockNumber))?.timestamp;

    return timestamp;
  } catch (error) {
    console.log('getTimestampOnChain error', error)
    throw error;
  }
}

export { formatDecimal, getDecimalPart, getTimestampOnChain }
