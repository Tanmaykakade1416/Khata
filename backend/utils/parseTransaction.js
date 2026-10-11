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

async function parseTransactionsText(description, currentDate) {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `We have provided you a transaction description and currentDate.
            Extract the following fields: type, amount, category, date. Return them in
            this exact JSON format only: { type: "", amount: "", category: "", date: "" }. 
            The type must be exactly one of: income, expense. If the type is income, 
            the category must be exactly one from this list: ${INCOME_CATEGORIES.join(", ")}. 
            If the type is expense, the category must be exactly one from this list: ${EXPENSE_CATEGORIES.join(", ")} 
            .If you cannot confidently determine a value, return null for that field instead of guessing. 
            Use the provided today's date to resolve relative dates like 'yesterday' or 'day before yesterday'`,
        },
        {
          role: "user",
          content: `Today's date is ${currentDate}. Transaction description: ${description}`,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const result = response.choices[0].message.content.trim();
    const parseData = JSON.parse(result);
    return { success: true, data: parseData };
  } catch (error) {
    console.error("AI failed to delever", error);
    return {
      success: false,
      message:
        "Could not understand your input, please try rephrasing or fill manually",
    };
  }
}

module.exports = parseTransactionsText;
