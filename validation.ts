import { ethers } from "ethers";
import { getTimestampOnChain } from "./data";
import { decryptSignature } from "../helpers/functionsHelper";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { settings } from "./settings";

async function verifySignPermission(wallet: string, signature: string, message: string): Promise<{ status: boolean, message: string, auth_token: string }> {
  try {
    const decryptedData = JSON.parse(JSON.parse(decryptSignature(message)));

    if (decryptedData?.timestamp == null) {
      console.log('get timestamp fail');
      return { status: false, message: "Invalid date", auth_token: '' };
    }

    const currentTimestamp = await getTimestampOnChain();
    const differenceInSeconds = (currentTimestamp ? currentTimestamp : 0) - decryptedData.timestamp;
    const isOld = differenceInSeconds > 120;

    if (isOld) {
      console.log('timestamp is too old');
      return { status: false, message: "Token expired", auth_token: '' };
    }

    const signWallet = ethers.verifyMessage(message, signature);

    if (signWallet.toLocaleLowerCase() != wallet.toLocaleLowerCase()) {
      return { status: false, message: "Permission is not granted", auth_token: '' };
    }

    const userRepository = new UserRepository();
    const userData = await userRepository.findByWallet(signWallet)

    if (!userData) {
      return { status: false, message: "Your wallet can't access the system", auth_token: '' };
    }

    const payload = {
      signWallet,
      signature
    };

    const options = {
      expiresIn: settings.JWT_EXPIRATION
    };

    const token = jwt.sign(payload, settings.JWT_SECRET_KEY, options);

    return { status: true, message: "Success", auth_token: token };
  } catch (e) {
    console.log('error', e);
    return { status: false, message: "Verify permission error", auth_token: '' };
  }
}
export { verifySignPermission }
