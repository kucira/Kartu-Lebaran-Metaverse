import React from "react";
import dynamic from "next/dynamic";

const Cards = dynamic(() => import("./Cards"));

export default function FormCard({ sendGif, sendSol, gifList, setGifList }) {
  return (
    <div className="connected-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          sendGif(formData, setGifList);
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <input
              name="inputGif"
              type="text"
              placeholder="Gambar Gif Lebaran"
            />
            <input
              name="inputWallet"
              type="text"
              placeholder="Alamat Wallet Penerima"
            />
            <input name="inputSol" type="text" placeholder="Jumlah Sol" />
            <div>
              <button type="submit" className="cta-button submit-gif-button">
                Kirim Kartu Lebaran
              </button>
            </div>
          </div>
        </div>
      </form>

      <Cards data={gifList} sendSol={sendSol} />
    </div>
  );
}
