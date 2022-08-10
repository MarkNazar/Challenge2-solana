// Import Solana web3 functinalities
const { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmRawTransaction, sendAndConfirmTransaction } = require('@solana/web3.js');

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  19, 219, 36, 224, 127, 228, 40, 120, 102, 204, 115, 185, 108, 45, 63, 209, 201, 35, 118, 94, 20, 90, 29, 172, 202, 104, 34, 224, 78, 60, 152, 228, 215, 97, 160, 80, 105, 143, 117, 226, 63, 88, 204,
  242, 181, 79, 61, 115, 103, 130, 163, 52, 137, 227, 113, 147, 20, 176, 53, 64, 150, 93, 95, 134,
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
