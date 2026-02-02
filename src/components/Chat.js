import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../ChatContractAbi.json";
import ipfs from "../ipfs";
import CryptoJS from "crypto-js";
import { CONTRACT_ADDRESS } from "../contract";

export default function Chat({ provider, encryptionKey, myAddress }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");

  // SEND MESSAGE 
  const sendMessage = async () => {
    try {
      setStatus("Sending message...");
      
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }

      if (!to) {
        setStatus("Enter recipient address");
        return;
      }

      if (!message.trim()) {
        setStatus("Enter a message");
        return;
      }

      if (!encryptionKey) {
        setStatus("Encryption key missing");
        return;
      }

      if (!provider) {
        setStatus("Wallet not connected");
        return;
      }

      // Get signer
      let signer;
      if (provider.getSigner) {
        signer = await provider.getSigner();
      } else if (provider.sendTransaction) {
        signer = provider;
      } else {
        setStatus("Cannot get signer");
        return;
      }

      // Check contract address
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
        setStatus("Contract address not configured");
        return;
      }

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer
      );

      // Encrypt message
      const cipher = CryptoJS.AES.encrypt(message, encryptionKey).toString();

      // Upload to IPFS
      const ipfsData = JSON.stringify({ cipher, timestamp: Date.now() });
      const result = await ipfs.add(ipfsData);
      const path = result.path || result.cid.toString();

      // Send transaction
      setStatus("Sending transaction...");
      const tx = await contract.sendMessage(to, path);
      setStatus(`Transaction sent! Hash: ${tx.hash.substring(0, 10)}...`);

      // Wait for confirmation
      const receipt = await tx.wait();
      setStatus("Message sent successfully!");

      // Clear input
      setMessage("");
      
      // Refresh messages
      setTimeout(() => {
        fetchMessages();
      }, 2000);

    } catch (err) {
      console.error("Send message error:", err);
      
      if (err.message.includes("user rejected")) {
        setStatus("Transaction rejected by user");
      } else if (err.message.includes("insufficient funds")) {
        setStatus("Insufficient funds for gas");
      } else if (err.message.includes("nonce")) {
        setStatus("Nonce error - try resetting account in MetaMask");
      } else {
        setStatus(`Error: ${err.message.substring(0, 100)}`);
      }
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!provider || !encryptionKey || !myAddress) {
      return;
    }

    try {
      const readContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        provider
      );

      const count = await readContract.getMessageCount(myAddress);
      const temp = [];
      
      for (let i = 0; i < count; i++) {
        const msg = await readContract.messages(myAddress, i);
        
        try {
          const decrypted = CryptoJS.AES.decrypt(
            msg.cipher,
            encryptionKey
          ).toString(CryptoJS.enc.Utf8);
          
          temp.push({
            from: msg.from,
            text: decrypted,
            timestamp: msg.timestamp || Date.now(),
          });
        } catch (decryptErr) {
          temp.push({
            from: msg.from,
            text: "[Unable to decrypt]",
          });
        }
      }

      setMessages(temp);
      
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // POLL MESSAGES
  useEffect(() => {
    if (!provider || !encryptionKey || !myAddress) return;

    // Initial fetch
    fetchMessages();
    
    // Set up polling
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [provider, encryptionKey, myAddress]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-orange-500 text-center">
          Secure Chat
        </h1>

        {/* Status Bar */}
        <div className={`p-3 rounded-lg mb-6 ${
          status.includes("Error") || status.includes("❌") 
            ? "bg-red-900/30 border border-red-700" 
            : status.includes("success") || status.includes("✓")
            ? "bg-green-900/30 border border-green-700"
            : "bg-gray-900 border border-gray-700"
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">{status || "Ready to chat"}</span>
            <span className="text-xs text-gray-400">
              {myAddress ? `Connected as: ${myAddress.slice(0, 10)}...` : "Not connected"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - User List */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-800 bg-[#0f0f0f] p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-500">
                Active Users
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${
                        user.toLowerCase() === to.toLowerCase() 
                          ? 'bg-orange-500/20 border border-orange-500/50' 
                          : 'bg-gray-900'
                      }`}
                      onClick={() => setTo(user)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {user.slice(2, 4).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[180px]">
                            {user.slice(0, 6)}...{user.slice(-4)}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active users found</p>
                    <p className="text-sm mt-2">Users will appear here when they join</p>
                  </div>
                )}
                
                {/* My Address Card */}
                {myAddress && (
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                      Your Address
                    </h3>
                    <div className="p-3 rounded-lg bg-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                          <span className="text-sm font-bold">ME</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[180px]">
                            {myAddress.slice(0, 6)}...{myAddress.slice(-4)}
                          </p>
                          <p className="text-xs text-green-400 truncate">
                            Online
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-800 bg-[#0f0f0f] p-6 h-full">
              <h2 className="text-xl font-semibold mb-4 text-orange-500">
                {to ? `Chat with ${to.slice(0, 6)}...${to.slice(-4)}` : 'Secure Chat'}
              </h2>

              {/* Message Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Recipient Address
                  </label>
                  <input
                    className="w-full mb-3 p-3 rounded-lg bg-black border border-gray-700 text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0x..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Your Message
                  </label>
                  <textarea
                    className="w-full mb-3 p-3 rounded-lg bg-black border border-gray-700 text-white focus:border-orange-500 focus:outline-none min-h-[100px]"
                    placeholder="Type your encrypted message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!to || !message}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    !to || !message
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 hover:scale-[1.02]'
                  }`}
                >
                  {!to ? 'Enter recipient address' : !message ? 'Enter message' : 'Send Encrypted Message'}
                </button>
              </div>

              {/* Messages Display */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">
                  Messages ({messages.length})
                </h3>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {messages.length > 0 ? (
                    messages.map((m, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg ${
                          m.from.toLowerCase() === myAddress.toLowerCase()
                            ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 ml-8 border-l-4 border-orange-500"
                            : "bg-gradient-to-r from-gray-800 to-gray-900 mr-8 border-l-4 border-gray-600"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-medium ${
                            m.from.toLowerCase() === myAddress.toLowerCase()
                              ? "text-orange-400"
                              : "text-blue-400"
                          }`}>
                            {m.from.toLowerCase() === myAddress.toLowerCase() 
                              ? "You" 
                              : `${m.from.slice(0, 8)}...${m.from.slice(-6)}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-200">{m.text}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {m.from.toLowerCase() === myAddress.toLowerCase() 
                            ? "Encrypted & stored on IPFS" 
                            : "Decrypted from IPFS"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-300 mb-2">
                        No messages yet
                      </h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {to 
                          ? `Send your first encrypted message to ${to.slice(0, 6)}...${to.slice(-4)}`
                          : 'Select a user or enter an address to start chatting'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-800 bg-[#0f0f0f] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Messages</p>
                <p className="text-xl font-bold">{messages.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-800 bg-[#0f0f0f] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-8.906a8.962 8.962 0 00-5.707-2.027M8.5 8.906A8.962 8.962 0 002.75 11m13.5 8.906A8.962 8.962 0 0121.25 11m-13.5 0a8.962 8.962 0 015.707 2.027" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-gray-800 bg-[#0f0f0f] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Security</p>
                <p className="text-xl font-bold">AES-256</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}