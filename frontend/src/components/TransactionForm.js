import React, { useState, useEffect } from "react";

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Personal Care",
  "Other",
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

const TransactionForm = ({ onSubmit, editingTransaction, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        description: editingTransaction.description || "",
        date: new Date(editingTransaction.date).toISOString().split("T")[0],
      });
    }
  }, [editingTransaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset category when type changes
      ...(name === "type" ? { category: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingTransaction) {
      onSubmit(editingTransaction._id, transactionData);
    } else {
      onSubmit(transactionData);
    }

    // Reset form
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const categories =
    formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div className="flex gap-4">
        <label className="flex-1">
          <input
            type="radio"
            name="type"
            value="expense"
            checked={formData.type === "expense"}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-red-600 font-semibold">Expense</span>
        </label>
        <label className="flex-1">
          <input
            type="radio"
            name="type"
            value="income"
            checked={formData.type === "income"}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-green-600 font-semibold">Income</span>
        </label>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Amount (₹)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Description (Optional)
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Add a note..."
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          {editingTransaction ? "Update" : "Add"} Transaction
        </button>
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;
