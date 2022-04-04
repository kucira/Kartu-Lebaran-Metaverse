import idl from "../idl.json";
import kp from "./keypair.json";

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "confirmed",
};

let SolanaWeb3,
  AnchorSerum,
  baseAccount,
  programID,
  user,
  network,
  SystemProgram;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);

const checkIfWalletConnected = async (setWalletAddress) => {
  try {
    if (typeof window !== "undefined") {
      const { solana } = window;

      if (solana && solana.isPhantom) {
        console.log("solana phantom found");
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          "Connected with Public Key:",
          response.publicKey.toString()
        );
        setWalletAddress(response.publicKey.toString());
        return;
      }

      alert("Solana object not found! Get a Phantom Wallet 👻");
      return;
    }
  } catch (error) {
    console.log(error);
  }
};

const connectWallet = async (setWalletAddress) => {
  const { solana } = window;
  if (solana) {
    const response = await solana.connect();
    console.log("Connected with Public Key:", response.publicKey.toString());
    setWalletAddress(response.publicKey.toString());
  }
};

const getConnection = () => {
  const connection = new SolanaWeb3.Connection(
    network,
    opts.preflightCommitment
  );
  return connection;
};

const getProvider = () => {
  const connection = new SolanaWeb3.Connection(
    network,
    opts.preflightCommitment
  );
  const provider = new AnchorSerum.Provider(
    connection,
    window.solana,
    opts.preflightCommitment
  );
  return provider;
};

const sendSol = async (recipient, amount) => {
  // send sol to owner of image
  try {
    // Add transfer instruction to transaction
    const provider = getProvider();
    const { connection, wallet } = provider;

    // Create Simple Transaction
    let tx = new AnchorSerum.web3.Transaction();

    // Add an instruction to execute
    // transfer sol with common examples will bring error Uncaught (in promise) TypeError: unexpected type, use Uint8Array
    // fix this issue by using this function
    // https://dev.to/qpwo/how-to-sign-anchor-transactions-with-phantom-or-other-wallets-in-the-browser-845
    tx.add(
      AnchorSerum.web3.SystemProgram.transfer({
        fromPubkey: new SolanaWeb3.PublicKey(provider.wallet.publicKey.toString()),
        toPubkey: new SolanaWeb3.PublicKey(recipient.toString()),
        lamports: SolanaWeb3.LAMPORTS_PER_SOL * +amount,
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

const setupModule = async () => {
  return new Promise((resolve, reject) => {
    import("@solana/web3.js").then(mod => {
      SolanaWeb3 = mod;
      import("@project-serum/anchor").then(m => {
        AnchorSerum = m;
        resolve()
      });
    });
  })
};

const getProgram = async () => {
  await setupModule();

  console.log(SolanaWeb3, 'packl')
  
  // Set our network to devnet.
  network = SolanaWeb3.clusterApiUrl("devnet");
  // Get our program's id from the IDL file.
  programID = new SolanaWeb3.PublicKey(idl.metadata.address);
  baseAccount = SolanaWeb3.Keypair.fromSecretKey(secret);
  SystemProgram = AnchorSerum.web3;

  const provider = getProvider();
  user = provider.wallet;
  const program = new AnchorSerum.Program(idl, programID, provider);

  return program;
};

export {
  checkIfWalletConnected,
  connectWallet,
  getProvider,
  getConnection,
  getProgram,
  baseAccount,
  user,
  SystemProgram,
  sendSol,
};
