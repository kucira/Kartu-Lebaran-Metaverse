import dynamic from "next/dynamic";

import {
  checkIfWalletConnected,
  connectWallet,
  getProgram,
  baseAccount,
  SystemProgram,
  user,
  sendSol,
} from "../utils/helpers";

import { useEffect, useState } from "react";

const FormCard = dynamic(() => import("../components/FormCard"), {
  loading: () => <p>...</p>,
});
const InitializeButton = dynamic(
  () => import("../components/InitializeButton"),
  { loading: () => <p>...</p> }
);
const ConnectWalletButton = dynamic(
  () => import("../components/ConnectWallet"),
  { loading: () => <p>...</p> }
);

const handleLoadWallet = (setWalletAddress) => {
  const onLoad = async () => {
    await checkIfWalletConnected(setWalletAddress);
  };

  window.addEventListener("load", onLoad);
  return () => window.removeEventListener("load", onLoad);
};

const getGifList = async (setGifList) => {
  try {
    const program = await getProgram();
    const account = await program.account.baseAccount.fetch(
      baseAccount.publicKey
    );

    console.log("Got the account", account);
    setGifList(account.gifList);
  } catch (error) {
    console.log("Error in getGifList: ", error);
    setGifList(null);
  }
};

const createGifAccount = async (setGifList) => {
  try {
    const program = await getProgram();
    console.log("ping");
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    console.log(
      "Created a new BaseAccount w/ address:",
      baseAccount.publicKey.toString()
    );
    await getGifList(setGifList);
  } catch (error) {
    console.log("Error creating BaseAccount account:", error);
  }
};

const handleFetchGif = (walletAddress, setGifList) => {
  if (walletAddress) {
    console.log("Fetching GIF list...");
    getGifList(setGifList);
  }
};

const sendGif = async (formData, setGifList) => {
  const inputGif = formData.get("inputGif");
  const inputWallet = formData.get("inputWallet");
  const inputSol = formData.get("inputSol");

  if (inputGif.length === 0) {
    console.log("No gif link given!");
    return;
  }

  if (inputGif.length > 0) {
    console.log("Gif link:", inputGif);
    document.getElementsByName("inputGif").value = "";

    try {
      const program = await getProgram();

      await program.rpc.addGif(inputGif, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: user.publicKey,
        },
      });
      await sendSol(inputWallet, inputSol);
      console.log("GIF successfully sent to program", inputGif);

      await getGifList(setGifList);
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  } else {
    console.log("Empty input. Try again.");
  }
};

const voteData = async (link, owner) => {
  // call program/contract to vote data
  const program = await getProgram();
  await program.rpc.voteData(link);
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [gifList, setGifList] = useState(null);

  useEffect(() => {
    handleLoadWallet(setWalletAddress);
  }, []);

  useEffect(() => {
    handleFetchGif(walletAddress, setGifList);
  }, [walletAddress]);

  return (
    <div className="App">
      <div className="container">
        <div className={walletAddress ? "authed-container" : "container"}>
          <div className="header-container">
            <p className="header">🖼 Portal Kartu Lebaran Metaverse</p>
            <p className="sub-text">
              Kirim Kartu Lebaran dan THR di dunia metaverse ✨
            </p>
            {!walletAddress && (
              <ConnectWalletButton
                connectWallet={connectWallet}
                setWalletAddress={setWalletAddress}
              />
            )}
          </div>
          {walletAddress && !gifList && (
            <InitializeButton
              createGifAccount={createGifAccount}
              setGifList={setGifList}
            />
          )}

          {walletAddress && gifList && (
            <FormCard
              sendGif={sendGif}
              sendSol={sendSol}
              gifList={gifList}
              setGifList={setGifList}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
