const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generatePrompt = ({ topic, weather, ndvi, location, cropName, growthStage, language }) => {
  const forecast = weather.map((day, i) => `Day ${i + 1}: ${day.maxTemp}°C, Rain: ${day.rainfall}%, ${day.condition}`).join("\n");

  const common = `
📍 Location: (${location.lat}, ${location.lng})
🌾 Crop: ${cropName} | Stage: ${growthStage}
🌤️ 3-Day Forecast:
${forecast}
🛰️ NDVI Summary:
- Mean: ${ndvi.ndvi_mean}, Min: ${ndvi.ndvi_min}, Max: ${ndvi.ndvi_max}
- Poor: ${ndvi.ndvi_breakdown.poor_percent}%, Moderate: ${ndvi.ndvi_breakdown.moderate_percent}%, Good: ${ndvi.ndvi_breakdown.good_percent}%

✍️ Output must be limited to 3–4 lines ONLY. Avoid long paragraphs. Be precise and farmer-friendly.
Language: ${language}
`;

  const topicInstructions = {
    "Crop Health": `🎯 Assess crop health using NDVI + weather. Give 1 reason + 2 quick tips.`,
    "Irrigation": `🎯 Should the farmer irrigate now? Mention yes/no + reason + short tip.`,
    "Harvest Readiness": `🎯 Is crop ready for harvest? Give quick readiness hint + action.`,
    "Weather Alert": `🎯 Highlight severe forecast if any. Suggest 1–2 safety actions.`,
    "General Advisory": `🎯 Suggest daily care tip using NDVI + weather. Add 1 smart tip.`,
  };

  const languageHint = language === "Hindi"
    ? `Use simple Hindi, limit to 3–4 short lines.`
    : `Use simple English, 3–4 lines max. Avoid long explanation.`;

  return `${common}\n${topicInstructions[topic] || topicInstructions["General Advisory"]}\n\n${languageHint}`;
};

router.post("/getAdvice", async (req, res) => {
  try {
    const { topic, weather, ndvi, location, cropName = "Wheat", growthStage = "Growth", language = "English" } = req.body;

    if (!topic || !weather || !ndvi || !location) {
      return res.status(400).json({ error: "Missing parameters." });
    }

    const prompt = generatePrompt({ topic, weather, ndvi, location, cropName, growthStage, language });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ advice: text });
  } catch (err) {
    console.error("❌ Gemini Error:", err);
    res.status(500).json({ error: "Failed to generate advisory." });
  }
});

module.exports = router;
