'use client';

import { useState } from 'react';
import ExpenseTracker from "./components/expenseState";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from '@solana/web3.js'; // Correct import
import { program, getExpensePDA } from './components/setup'; // Import program setup
import { BN } from '@coral-xyz/anchor'; // Ensure you're using BN for number handling

export default function Home() {
  const wallet = useWallet();
  const [expenseId, setExpenseId] = useState(0);
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState(0);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  // Initialize Expense function
  const initializeExpense = async () => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet.');
      return;
    }
  
    try {
      console.log('Wallet Public Key:', wallet.publicKey.toString());
      console.log('Expense ID:', expenseId);
      console.log('Merchant Name:', merchantName);
      console.log('Amount:', amount);
  
      // Generate Program Derived Address (PDA)
      const expensePDA = await getExpensePDA(wallet.publicKey, expenseId);
      console.log('Generated Expense PDA:', expensePDA.toString());
  
      // Send transaction to initialize expense
      const tx = await program.methods
        .initializeExpense(new BN(expenseId), merchantName, new BN(amount))
        .accounts({
          expenseAccount: expensePDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId, // Corrected usage
        }).transaction()
      const txSign = await sendTransaction(
        tx,
        connection
      )
      console.log('Transaction Signature:', txSign);
  
      alert('Expense initialized successfully!');
    } catch (error) {
      console.error('Error initializing expense:', error);
  
      // Additional logging of the error details
      if (error.logs) {
        console.error('Error Logs:', error.logs);
      }
  
      alert('Failed to initialize expense. See the console for details.');
    }
  };
  
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border p-6 rounded hover:border-slate-900">
        <h1 className="text-xl font-bold mb-4">Solana Expense Tracker</h1>
        <WalletMultiButton />
        <div className="mt-4">
          <input
            type="number"
            placeholder="Expense ID"
            className="border p-2 mr-2"
            value={expenseId}
            onChange={(e) => setExpenseId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Merchant Name"
            className="border p-2 mr-2"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 mr-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white p-2 mt-4 rounded"
          onClick={initializeExpense}
        >
          Initialize Expense
        </button>
        <ExpenseTracker />
      </div>
      
    </main>
  );
}
