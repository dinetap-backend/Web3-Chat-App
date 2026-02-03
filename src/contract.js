import { ethers } from "ethers";
import abi from "./ChatContractAbi.json";

export const CONTRACT_ADDRESS =
  "0x.....";



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
