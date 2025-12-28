import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { transactionAPI } from "../services/api";
import { toast } from "react-toastify";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import Charts from "./Charts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch transactions");
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await transactionAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      toast.error("Failed to fetch summary");
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await transactionAPI.create(transactionData);
      toast.success("Transaction added successfully!");
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    try {
      await transactionAPI.update(id, transactionData);
      toast.success("Transaction updated successfully!");
      setEditingTransaction(null);
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      toast.error("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionAPI.delete(id);
        toast.success("Transaction deleted successfully!");
        fetchTransactions();
        fetchSummary();
      } catch (error) {
        toast.error("Failed to delete transaction");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Khata</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}!</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Total Income
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₹{summary.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₹{summary.totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
              Net Balance
            </h3>
            <p className="text-3xl font-bold mt-2">
              ₹{summary.balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transaction Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <TransactionForm
              onSubmit={
                editingTransaction
                  ? handleUpdateTransaction
                  : handleAddTransaction
              }
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Transactions
            </h2>
            <TransactionList
              transactions={transactions.slice(0, 10)}
              onEdit={setEditingTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>

        {/* Charts */}
        <Charts transactions={transactions} />
      </main>
    </div>
  );
};

export default Dashboard;
