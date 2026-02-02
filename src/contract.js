import { ethers } from "ethers";
import abi from "./ChatContractAbi.json";

export const CONTRACT_ADDRESS =
  "0x7a37eCd53B1060F6cb4b5CeDa7B15caB2e2b6A41";



export const getContract = async (withSigner = false) => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  if (withSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  } else {
    return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  }
};