// utils/parseWhatsapp.js
// Extended WhatsApp chat parser with metadata extraction

export default function parseWhatsapp(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const messages = [];

  const regexes = [
    // [3/6/22, 11:11:20 PM] Name: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+([\d:]+(?:\u202F?[APMapm]{2})?)\]\s([^:]+):\s(.*)$/,
    // 3/6/22, 11:11 PM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+([\d:]+(?:\u202F?[APMapm]{2})?)\s-\s([^:]+):\s(.*)$/
  ];

  for (const line of lines) {
    let matched = false;
    for (const regex of regexes) {
      const m = line.match(regex);
      if (m) {
        const [_, date, time, sender, message] = m;
        messages.push({ date, time, sender, text: message.trim() });
        matched = true;
        break;
      }
    }
    if (!matched && messages.length > 0) {
      messages[messages.length - 1].text += "\n" + line.trim();
    }
  }

  if (messages.length === 0) return { participants: [], messages: [] };

  // Participants
  const participants = [...new Set(messages.map((m) => m.sender))];

  // Sort by date to compute range
  const toDate = (d) => {
    const [month, day, year] = d.split("/");
    const y = year.length === 2 ? "20" + year : year;
    return new Date(`${y}-${month}-${day}`);
  };

  const sorted = [...messages].sort(
    (a, b) => toDate(a.date) - toDate(b.date)
  );
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;

  // Guess chat name
  let chatName = "Group Chat";
  if (participants.length === 2) {
    // Assume you are participant[0] — show the other person
    chatName = participants[1];
  }

  return { participants, messages, chatName, firstDate, lastDate };
}
