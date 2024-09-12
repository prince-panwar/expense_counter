import { Program, BN } from '@coral-xyz/anchor';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import IDL  from './idl'; // Import the IDL file for your expense tracker program

// Define the program ID
const programId = new PublicKey("dE46xy4wiBpHM6EC6V7tRXzdKBG4YgGBiDpgKqj8eL1");

// Set up the connection to the Solana devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(IDL, programId,{connection});

// Generate a Program Derived Address (PDA) for the expense account
export const getExpensePDA = async (userPubkey, expenseId) => {
  const [expensePDA] =  PublicKey.findProgramAddressSync(
    [Buffer.from('expense'), userPubkey.toBuffer(), new BN(expenseId).toArrayLike(Buffer, 'le', 8)],
    program.programId
  );
  return expensePDA;



};
