import React, { useState, useEffect } from "react";
import { getContract } from "../contract";
import ipfs from "../ipfs";
import CryptoJS from "crypto-js";

export default function Chat({ encryptionKey, myAddress }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message || !to) return;

    try {
      const contract = await getContract(true);

      const cipher = CryptoJS.AES.encrypt(
        message,
        encryptionKey
      ).toString();

      const { path } = await ipfs.add(JSON.stringify({ cipher }));

      const tx = await contract.sendMessage(to, path);
      await tx.wait();

      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // LOAD MESSAGES
  useEffect(() => {
    if (!myAddress || !encryptionKey) return;

    let interval = setInterval(async () => {
      try {
        const contract = await getContract(false);
        const count = await contract.getMessageCount(myAddress);

        const list = [];
        for (let i = 0; i < count; i++) {
          const msg = await contract.messages(myAddress, i);
          const decrypted = CryptoJS.AES.decrypt(
            msg.cipher,
            encryptionKey
          ).toString(CryptoJS.enc.Utf8);

          list.push({ from: msg.from, text: decrypted });
        }
        setMessages(list);
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [myAddress, encryptionKey]);

  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-[#0f0f0f]">
      <h2 className="text-xl font-semibold mb-4 text-orange-500">
        Secure Chat
      </h2>

      <input
        className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
        placeholder="Recipient address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <textarea
        className="w-full mb-3 p-2 rounded bg-black border border-gray-700"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 font-semibold"
      >
        Send Message
      </button>

      <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="text-sm text-gray-300">
            <b className="text-orange-400">
              {m.from.slice(0, 6)}:
            </b>{" "}
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}
