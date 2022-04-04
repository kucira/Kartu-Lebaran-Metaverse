import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Program, web3 } from "@project-serum/anchor";
import dynamic from "next/dynamic";

import {
  checkIfWalletConnected,
  connectWallet,
  getProvider,
} from "../utils/helpers";
import idl from "../idl.json";
import kp from "../utils/keypair.json";

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

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

const handleLoadWallet = (setWalletAddress) => {
  const onLoad = async () => {
    await checkIfWalletConnected(setWalletAddress);
  };

  window.addEventListener("load", onLoad);
  return () => window.removeEventListener("load", onLoad);
};

const getGifList = async (setGifList) => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
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
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    console.log("ping");
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
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
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputGif, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
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
  const provider = getProvider();
  const program = new Program(idl, programID, provider);
  await program.rpc.voteData(link);
};

const sendSol = async (recipient, amount) => {
  // send sol to owner of image
  try {
    // Add transfer instruction to transaction
    const provider = getProvider();
    const { connection, wallet } = provider;

    // Create Simple Transaction
    let tx = new web3.Transaction();

    // Add an instruction to execute
    // transfer sol with common examples will bring error Uncaught (in promise) TypeError: unexpected type, use Uint8Array
    // fix this issue by using this function
    // https://dev.to/qpwo/how-to-sign-anchor-transactions-with-phantom-or-other-wallets-in-the-browser-845
    tx.add(
      web3.SystemProgram.transfer({
        fromPubkey: new PublicKey(provider.wallet.publicKey.toString()),
        toPubkey: new PublicKey(recipient.toString()),
        lamports: LAMPORTS_PER_SOL * +amount,
      })
    );

    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signedTx = await wallet.signTransaction(tx);
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    const signature = await connection.confirmTransaction(txId);
    console.log(signature, "signature");
  } catch (error) {
    console.log(error);
  }
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [gifList, setGifList] = useState(null);

  const renderConnectedContainer = () => {
    if (!gifList) {
      return (
        <InitializeButton
          createGifAccount={createGifAccount}
          setGifList={setGifList}
        />
      );
    }
    return <FormCard sendGif={sendGif} sendSol={sendSol} gifList={gifList} />;
  };

  const renderConnectButton = () => {
    return (
      <ConnectWalletButton
        connectWallet={connectWallet}
        setWalletAddress={setWalletAddress}
      />
    );
  };

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
            {!walletAddress && renderConnectButton()}
          </div>
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;
