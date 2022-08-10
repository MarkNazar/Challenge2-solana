// Import Solana web3 functinalities
const { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmRawTransaction, sendAndConfirmTransaction } = require('@solana/web3.js');

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  48, 156, 40, 204, 94, 187, 222, 148, 136, 179, 102, 229, 116, 71, 28, 40, 239, 108, 222, 94, 1, 145, 49, 177, 56, 21, 85, 56, 126, 127, 108, 210, 141, 211, 109, 23, 232, 111, 98, 247, 229, 142, 68,
  140, 87, 156, 123, 238, 199, 191, 214, 63, 182, 47, 81, 92, 12, 135, 20, 166, 99, 15, 143, 209,
]);

// const newPair = Keypair.generate();
// console.log(newPair);

var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
const to = Keypair.generate();

const sendAirdrop = async () => {
  console.log('Airdopping some SOL to Sender wallet!');
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(from.publicKey), 2 * LAMPORTS_PER_SOL);
  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });
  console.log('Airdrop completed for the Sender account');
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  // const to = Keypair.generate();

  // Send money from "from" wallet and into "to" wallet
  const fromCurrentBalance = await connection.getBalance(new PublicKey(from.publicKey));
  const calculatedLamports = fromCurrentBalance / LAMPORTS_PER_SOL / 2;

  console.log(`Trasnferring to "To Wallet"`);
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: calculatedLamports * LAMPORTS_PER_SOL,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [from]);
  console.log('Signature is ', signature);
};

const logWalletBalance = async () => {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const fromWalletBalance = await connection.getBalance(new PublicKey(from.publicKey));
    const toWalletBalance = await connection.getBalance(new PublicKey(to.publicKey));
    console.log(`From Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`);
    console.log(`To Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.log(err);
  }
};

const mainFunction = async () => {
  await logWalletBalance();
  await sendAirdrop();
  await logWalletBalance();
  await transferSol();
  await logWalletBalance();
};

mainFunction();
