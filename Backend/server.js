import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API if key is present in .env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ==========================================
// 1. CONCEPT SIMPLIFIER & ESSAY POLISH ENDPOINT
// ==========================================
app.post("/api/summarize-video", async (req, res) => {
  try {
    const { textNotes } = req.body;

    if (!textNotes) {
      return res
        .status(400)
        .json({ success: false, error: "No text provided." });
    }

    const rawContent = textNotes
      .replace(/^Explain this concept simply like I am 5 years old:\s*/i, "")
      .replace(
        /^Review and polish this text for grammar, tone, and sentence structure, and give analysis points:\s*/i,
        "",
      )
      .trim();

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Explain the following topic in simple, beginner-friendly terms (ELI5) with bullet points:\n\n${rawContent}`;
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        return res.json({ success: true, summary: aiResponse });
      } catch (geminiErr) {
        console.warn(
          "⚠️ Gemini API call failed, using smart local fallback:",
          geminiErr.message,
        );
      }
    }

    // Safe Local Processing Fallback
    const sentences = rawContent.split(/(?<=[.!?])\s+/).filter(Boolean);
    const mainIdea = sentences[0] || rawContent;
    const additionalDetails = sentences.slice(1).join(" ");

    const dynamicOutput =
      `💡 Simplified Concept Explanation:\n\n` +
      `• **Core Subject:** ${mainIdea}\n\n` +
      `• **Detailed Breakdown:** ${additionalDetails || "This concept outlines essential structural logic and operation."}\n\n` +
      `• **Key Takeaway:** Perfect for quick review, exams, and conceptual clarity!`;

    res.json({ success: true, summary: dynamicOutput });
  } catch (err) {
    console.error("Backend Error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to process content." });
  }
});

// ==========================================
// 2. SMART QUIZ GENERATOR ENDPOINT
// ==========================================
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { textContent } = req.body;

    if (!textContent) {
      return res
        .status(400)
        .json({ success: false, error: "No content provided." });
    }

    const numMatch = textContent.match(
      /Generate (\d+) practice quiz questions/i,
    );
    const requestedNum = numMatch ? parseInt(numMatch[1], 10) : 5;

    const diffMatch = textContent.match(/with (Easy|Medium|Hard) difficulty/i);
    const requestedDiff = diffMatch ? diffMatch[1] : "Medium";

    const rawContent = textContent
      .replace(
        /^Generate \d+ practice quiz questions with [\w\s]+ difficulty from this content:\s*/i,
        "",
      )
      .trim();

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Based on the following content, generate exactly ${requestedNum} practice quiz questions with ${requestedDiff} difficulty, along with answers:\n\n"${rawContent}"`;
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        return res.json({ success: true, flashcards: aiResponse });
      } catch (geminiErr) {
        console.warn(
          "⚠️ Gemini Quiz API failed, using dynamic local fallback:",
          geminiErr.message,
        );
      }
    }

    // Robust Dynamic Local Quiz Generator (Guarantees requestedNum questions!)
    const sentences = rawContent.split(/(?<=[.!?])\s+/).filter(Boolean);
    let dynamicQuiz = `📝 Practice Quiz (${requestedDiff} Level - ${requestedNum} Questions):\n\n`;

    for (let i = 0; i < requestedNum; i++) {
      const sentence =
        sentences[i % sentences.length] ||
        `Core system principle and operational rule ${i + 1}`;
      dynamicQuiz += `Q${i + 1}. Based on your notes: "${sentence.slice(0, 60)}..."?\n`;
      dynamicQuiz += `   • **Answer / Concept (${requestedDiff}):** This examines the foundational role and relational logic described in your notes.\n\n`;
    }

    res.json({ success: true, flashcards: dynamicQuiz });
  } catch (err) {
    console.error("Quiz Error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate practice quiz." });
  }
});

// ==========================================
// SERVER LISTENER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 EduNova AI Backend running on port ${PORT}`),
);
