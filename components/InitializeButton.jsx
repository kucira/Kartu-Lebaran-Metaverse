import React from "react";

export default function InitializeButton({ createGifAccount, setGifList }) {
  return (
    <div className="connected-container">
      <button
        className="cta-button submit-gif-button"
        onClick={() => {
          createGifAccount(setGifList);
        }}
      >
        Inisialiasi Satu kali Ke Program Portal Kartu Lebaran Metaverse
      </button>
    </div>
  );
}
