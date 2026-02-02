import { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";

export default function useWallet() {
  const [address, setAddress] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");

    const prov = new ethers.BrowserProvider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    const sign = await prov.getSigner();
    const addr = await sign.getAddress();

    setProvider(prov);
    setSigner(sign);
    setAddress(addr);

    // Generate encryption key
    const signature = await sign.signMessage("Chat encryption key");
    const key = CryptoJS.SHA256(signature).toString();
    setEncryptionKey(key);
  };

  return { address, encryptionKey, connectWallet, provider, signer };
}
