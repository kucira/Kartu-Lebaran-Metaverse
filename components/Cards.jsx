import React from "react";

export default function Cards({ data = [], sendSol }) {
  return (
    <div className="gif-grid">
      {data.map((gif) => (
        <div className="gif-item" key={gif.gifLink}>
          <img src={gif.gifLink} alt={gif.gifLink} />
          <p
            className="sub-text"
            style={{
              fontSize: 14,
            }}
          >
            Pemilik : {gif.userAddress.toString()}
          </p>
          <div>
            <button className="cta-button connect-wallet-button">Bagikan</button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                sendSol(gif.userAddress, formData.get("inputSol"));
              }}
            >
              <input name="inputSol" type="text" placeholder="Masukan Sol (cth: 0.005)" />
              <button className="cta-button submit-gif-button">
                Kirim THR ke Pemilik Gambar
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
