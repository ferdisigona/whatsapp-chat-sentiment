// utils/sentiment.js
import Sentiment from "sentiment";

/**
 * analyzeChatSentiment(chat)
 *  - Calculates sentiment per message
 *  - Aggregates average sentiment per day
 *  - Returns useful metadata for analytics & charts
 */

const sentiment = new Sentiment();

export function analyzeChatSentiment(chat) {
  if (!chat || !chat.messages) return null;

  // Per-message analysis
  const analyzed = chat.messages.map((m, index) => {
    const result = sentiment.analyze(m.text);
    return {
      index,
      sender: m.sender,
      text: m.text,
      score: result.score,
      date: m.date, // already parsed in parseWhatsapp
    };
  });

  // Group by date
  const groupedByDate = {};
  analyzed.forEach((msg) => {
    const day = msg.date;
    if (!groupedByDate[day]) groupedByDate[day] = [];
    groupedByDate[day].push(msg.score);
  });

  // Daily averages
  const dailyAverages = Object.entries(groupedByDate).map(([date, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { date, avg };
  });

  // Sort chronologically (important for chart)
  dailyAverages.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Overall stats
  const allScores = analyzed.map((m) => m.score);
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  const mostPositive = analyzed.reduce((a, b) => (a.score > b.score ? a : b));
  const mostNegative = analyzed.reduce((a, b) => (a.score < b.score ? a : b));

  return {
    avgScore,
    analyzed,
    dailyAverages,
    mostPositive,
    mostNegative,
  };
}

/**
 * getMoodLabel(score)
 * Maps numeric score to qualitative label.
 */
export function getMoodLabel(score) {
  if (score > 1) return "positive";
  if (score < -1) return "negative";
  return "neutral";
}