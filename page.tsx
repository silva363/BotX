/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import axios from "axios";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useGlobalContext } from "@/components/store/authContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { setToken, setAddress } = useGlobalContext();
  const { push } = useRouter();

  async function handleSignMessage(isFirst: boolean = true) {
    try {
      if (!window?.ethereum) {
        toast.error("Wait feel seconds");
        return;
      }

      if (!window?.ethereum.selectedAddress) {
        if (isFirst) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          handleSignMessage(false);
        } else {
          toast.error("Verify you browser permissions");
        }

        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = new ethers.JsonRpcSigner(provider, window?.ethereum.selectedAddress);

      const address = signer.address;
      console.log('Fetching sign message from:', `${process.env.NEXT_PUBLIC_API_URL}/user/get-sign-message`);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/get-sign-message`, {}, {
        headers: {
          authorization: process.env.NEXT_PUBLIC_API_KEY
        }
      });
      const message = response.data.message;
      const signature = await signer.signMessage(message);

      console.log('Sending auth request to:', `${process.env.NEXT_PUBLIC_API_URL}/user/auth`);
      const authResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/auth`, {
        address,
        message,
        signature
      }, {
        headers: {
          authorization: process.env.NEXT_PUBLIC_API_KEY
        }
      });

      if (authResponse.data.status) {
        window.localStorage?.setItem('wallet_address', address);
        window.localStorage?.setItem('authtoken', authResponse.data.auth_token);
        setToken(authResponse.data.auth_token);
        setAddress(address);
        push('/dashboard/home')
      } else {
        toast.error((authResponse.data.message).toString());
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="login-page">
      <div>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>

      <div className="button-container">
        <p>Conecte sua carteira e depois clique no botão abaixo</p>
      </div>

      <div className="button-container">
        <button type="button" onClick={() => { handleSignMessage() }}>ENTRAR</button>
      </div>
    </div >
  );
}
