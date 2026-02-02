import React from "react";
import useWallet from "./hooks/useWallet";
import Chat from "./components/Chat"; 
function App() {
  const { address, encryptionKey, connectWallet, signer } = useWallet();

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Web3</span>{" "}
            <span className="text-orange-500">Secure Chat</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Encrypted • Decentralized • Private
          </p>
        </div>

        {/* Wallet Connection */}
        {!address ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0b0b0b] p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-orange-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-400 mb-6">
                Connect your wallet to start sending encrypted messages through IPFS and blockchain
              </p>
              <button
                onClick={connectWallet}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 font-semibold hover:opacity-90 transition text-lg"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : !signer ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-lg">Loading signer...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Connected Info Bar */}
            <div className="mb-8 p-4 rounded-xl border border-gray-800 bg-[#0f0f0f]">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                    <span className="font-bold">W</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Connected as</p>
                    <p className="font-medium">
                      {address.slice(0, 10)}...{address.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block text-sm text-gray-400">
                    <span className="text-green-400">●</span> Secure Connection
                  </div>
                  <button
                    onClick={() => {
                    
                      window.location.reload();
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>

            {/* Main Chat Component */}
            <Chat
              provider={signer}
              encryptionKey={encryptionKey}
              myAddress={address}
            />

            {/* Stats Footer */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-gray-800 bg-[#0f0f0f]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                    <svg 
                      className="w-5 h-5 text-orange-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Encryption</p>
                    <p className="text-lg font-bold">AES-256</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-gray-800 bg-[#0f0f0f]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                    <svg 
                      className="w-5 h-5 text-blue-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Storage</p>
                    <p className="text-lg font-bold">IPFS</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-gray-800 bg-[#0f0f0f]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 flex items-center justify-center">
                    <svg 
                      className="w-5 h-5 text-green-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Network</p>
                    <p className="text-lg font-bold">Blockchain</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-sm">
                Web3 Secure Chat • All messages are end-to-end encrypted • {new Date().getFullYear()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;