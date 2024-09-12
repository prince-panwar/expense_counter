import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, getExpensePDA } from "../components/setup"; // Import program and getExpensePDA utility
import {  SystemProgram } from '@solana/web3.js'; // Correct import
import { BN } from '@coral-xyz/anchor';
export default function ExpenseTracker() {
  const { connection } = useConnection();
  const {wallet, publicKey ,sendTransaction} = useWallet();
  const [expenses, setExpenses] = useState([]);
  
 // Utility function to fetch a single expense based on expense ID
 const fetchExpenseData = async (expenseId) => {
  try {
    const expensePDA = await getExpensePDA(publicKey, expenseId);
    const data = await program.account.expenseAccount.fetch(expensePDA);
    return {
      id: expenseId,
      merchantName: data.merchantName,
      amount: data.amount.toString(),
    };
  } catch (error) {
    console.error("Error fetching expense data:", error);
    return null;
  }
};

// Fetch all expenses for the connected user
const fetchExpenses = async () => {
  if (!publicKey) return;
  const userExpenses = [];
  try {
    // Loop over expense IDs (for example purposes, we assume 10 expenses exist)
    for (let expenseId = 1; expenseId <= 10; expenseId++) {
      const expense = await fetchExpenseData(expenseId);
      if (expense) userExpenses.push(expense);
    }
    setExpenses(userExpenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
};

const deleteExpense = async(id)=>{
  if(!publicKey){
    alert("Please connect a wallet");
  }
 
  const PDA = await getExpensePDA(publicKey,id);
  console.log('Wallet Public Key:', publicKey.toString());
  console.log('Expense ID:', id);
  console.log('PDA ',PDA.toString());

  try{
  const tx = await program.methods.deleteExpense(new BN(id)).accounts({
    expenseAccount: PDA,
    authority: publicKey,
    
  }).transaction();

  const txSign = await sendTransaction(tx,connection);
  alert("Expense deleted tx sign ", txSign);
}catch(e){
  console.log("error deleting ",e);

}
}

  useEffect(() => {
    fetchExpenses();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  return (
    <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Your Expenses</h2>
          <ul>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <li key={expense.id} className="border p-4 mb-2 rounded">
                  <p><strong>ID:</strong> {expense.id}</p>
                  <p><strong>Merchant:</strong> {expense.merchantName}</p>
                  <p><strong>Amount:</strong> {expense.amount}</p>
                  <button onClick={()=>deleteExpense(expense.id)}>Delete</button>
                </li>
              
              ))
            ) : (
              <p>No expenses found.</p>
            )}
          </ul>
        </div>
  );
}
