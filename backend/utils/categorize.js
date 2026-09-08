const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

async function getCategory(description, type) {
  const categoryList =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You categorize ${type} transactions. Given a description, respond with ONLY one exact category name from this list, nothing else: ${categoryList.join(", ")}`,
        },
        {
          role: "user",
          content: description,
        },
      ],
      temperature: 0,
    });

    const result = response.choices[0].message.content.trim();

    // Safety check: make sure AI's answer is actually in our list
    if (categoryList.includes(result)) {
      return result;
    }
    return "Other";
  } catch (error) {
    console.error("AI categorization failed:", error.message);
    return "Other";
  }
}

module.exports = getCategory;
