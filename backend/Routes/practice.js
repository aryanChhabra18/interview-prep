const express = require("express");
const router = express.Router();
const axios = require("axios");

// Initialize Gemini API
const GEMINI_API_KEY = "AIzaSyC3Rzk95tgmimIYaNy6ILvzQvVt3KRRa48"; // Replace with your actual API key


router.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// API endpoint for assessment evaluation

router.post("/evaluate", async (req, res) => {
  console.log("POST /evaluate-assessment hit");

  const { topic, topicTitle, answers } = req.body;

  if (!topic || !answers || Object.keys(answers).length === 0) {
    return res.status(400).json({ error: "Missing required data" });
  }

  const prompt = `
I need you to evaluate a technical assessment for the topic: ${topicTitle || topic}.

Here are the questions and the candidate's answers:

${Object.entries(answers).map(
  ([question, answer]) => `Question: ${question}\nAnswer: ${answer}\n`
).join("\n")}

Please provide:
1. An overall score out of 100
2. A brief general feedback (2-3 sentences)
3. Detailed feedback for each question

Format your response as a JSON object with the following structure:
{
  "score": [number between 0-100],
  "feedback": "[general feedback]",
  "detailedFeedback": {
    "Question 1": "[feedback for question 1]",
    "Question 2": "[feedback for question 2]"
  }
}
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    let evaluationResult;
    try {
      evaluationResult = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", parseError);
      console.log("Raw response:", rawText);

      // fallback dummy data
      evaluationResult = {
        score: 70,
        feedback: "Good attempt. There is room for improvement.",
        detailedFeedback: {}
      };
      Object.keys(answers).forEach((question, index) => {
        evaluationResult.detailedFeedback[`Question ${index + 1}`] =
          "Basic understanding shown. Try adding more technical depth.";
      });
    }

    res.json(evaluationResult);
  } catch (err) {
    console.error("Gemini API call failed:", err.message);
    res.status(500).json({
      error: "Evaluation failed",
      details: err.message
    });
  }
});

module.exports = router;

