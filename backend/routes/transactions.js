const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/auth");

// All routes are protected - user must be logged in

// @route   GET /api/transactions
// @desc    Get all transactions for logged in user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error fetching transactions" });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post(
  "/",
  [
    protect,
    body("type")
      .isIn(["income", "expense"])
      .withMessage("Type must be income or expense"),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, category, description, date } = req.body;

    try {
      const transaction = await Transaction.create({
        user: req.user._id,
        type,
        amount,
        category,
        description: description || "",
        date,
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "Server error creating transaction" });
    }
  }
);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put(
  "/:id",
  [
    protect,
    body("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be income or expense"),
    body("amount")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number"),
    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category cannot be empty"),
    body("date").optional().isISO8601().withMessage("Valid date is required"),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const transaction = await Transaction.findById(req.params.id);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Check if user owns this transaction
      if (transaction.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this transaction" });
      }

      // Update fields
      const { type, amount, category, description, date } = req.body;

      if (type) transaction.type = type;
      if (amount) transaction.amount = amount;
      if (category) transaction.category = category;
      if (description !== undefined) transaction.description = description;
      if (date) transaction.date = date;

      const updatedTransaction = await transaction.save();
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Update transaction error:", error);
      res.status(500).json({ message: "Server error updating transaction" });
    }
  }
);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if user owns this transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this transaction" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Server error deleting transaction" });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get income/expense summary
// @access  Private
router.get("/summary", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });

    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpense += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ message: "Server error fetching summary" });
  }
});

module.exports = router;
