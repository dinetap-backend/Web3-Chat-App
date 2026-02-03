# 🔐 Secure Decentralized Chat DApp

A **decentralized, end-to-end encrypted chat application** built with **React.js, Ethereum smart contracts, and IPFS**.  
Messages are encrypted on the client, stored on IPFS, and referenced on-chain.

---

## 🚀 Features

- 🔐 AES-256 end-to-end encryption
- 📦 IPFS storage for encrypted messages
- ⛓️ Ethereum smart contract messaging
- 🦊 MetaMask wallet integration
- 🔄 Real-time message polling
- 🌐 Fully decentralized architecture

---

## 🧠 How It Works

1. User connects wallet (MetaMask)
2. Message is encrypted using AES (CryptoJS)
3. Encrypted message is uploaded to IPFS
4. IPFS hash is stored on Ethereum smart contract
5. Receiver fetches hash and decrypts locally

> No plaintext data is stored on-chain.

---

## 🏗️ Tech Stack

**Frontend**
- React.js
- Ethers.js
- Tailwind CSS
- CryptoJS

**Blockchain**
- Solidity
- Ethereum / EVM compatible chain

**Storage**
- IPFS (gateway-based / simulated for testing)

---

## 📂 Project Structure

src/
├── components/Chat.jsx
├── ipfs.js
├── contract.js
├── ChatContractAbi.json
├── App.js
└── index.js


---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/secure-chat-dapp.git
cd secure-chat-dapp
npm install
npm start

Runs on: http://localhost:3000
🔧 Configuration

Update contract address:

export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

🔐 Security

    Messages encrypted before leaving browser

    Blockchain stores only IPFS hashes

    Private keys remain in MetaMask

    No backend server involved

🌍 Deployment

    Frontend: Vercel (Free tier)

    Smart Contract: Ethereum / Testnet

👨‍💻 Author

Shahnawaz
Blockchain & Smart Contract Developer
📜 License

MIT


---

### ✅ How to add it to GitHub

```bash
touch README.md
# paste content
git add README.md
git commit -m "Add project README"
git push
