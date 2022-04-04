import React from "react";

export default function ConnectWallet({ connectWallet, setWalletAddress }) {
  return (
    <button
      className="cta-button connect-wallet-button"
      onClick={() => {
        connectWallet(setWalletAddress);
      }}
    >
      Hubungkan ke Wallet
    </button>
  );
}