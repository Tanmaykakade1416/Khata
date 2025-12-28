import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const Charts = ({ transactions }) => {
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryMap = {};

    expenses.forEach((transaction) => {
      if (categoryMap[transaction.category]) {
        categoryMap[transaction.category] += transaction.amount;
      } else {
        categoryMap[transaction.category] = transaction.amount;
      }
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const monthMap = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        monthMap[monthKey].income += transaction.amount;
      } else {
        monthMap[monthKey].expense += transaction.amount;
      }
    });

    return Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((item) => ({
        month: new Date(item.month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income: parseFloat(item.income.toFixed(2)),
        expense: parseFloat(item.expense.toFixed(2)),
      }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Analytics</h2>
        <div className="text-center text-gray-500 py-8">
          Add some transactions to see your spending analytics
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense by Category - Pie Chart */}
        {expenseByCategory.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Expenses by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income vs Expense - Bar Chart */}
        {monthlyData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Income vs Expenses (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;
