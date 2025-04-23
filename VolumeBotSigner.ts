import { TransactionResponse } from "./TransactionResponse.model";
import { HDNodeWallet, Signer } from 'ethers';

export interface VolumeBotSigner {
  newSigner: Signer | null,
  newWallet: HDNodeWallet | null,
  transactionResponse: TransactionResponse | null,
  refundHash: string,
  success: boolean
}