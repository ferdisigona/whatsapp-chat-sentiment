// utils/parseWhatsapp.js
// Extended WhatsApp chat parser with metadata extraction

export default function parseWhatsapp(text, yourNameInput = "") {
  const normalizeName = (name) => (name || "").trim().toLowerCase();

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

  if (messages.length === 0)
    return {
      participants: [],
      messages: [],
      chatName: "Group Chat",
      firstDate: null,
      lastDate: null,
      yourName: null,
      enteredName: yourNameInput.trim() || null,
    };

  // Participants
  const participants = [...new Set(messages.map((m) => m.sender))];
  const normalizedParticipants = participants.map((p) => ({
    original: p,
    normalized: normalizeName(p),
  }));

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

  const normalizedYourName = normalizeName(yourNameInput);
  const findParticipantMatch = () => {
    if (!normalizedYourName) return null;

    const exact = normalizedParticipants.find(
      (entry) => entry.normalized === normalizedYourName
    );
    if (exact) return exact.original;

    const partial = normalizedParticipants.find(
      (entry) =>
        entry.normalized.includes(normalizedYourName) ||
        normalizedYourName.includes(entry.normalized)
    );
    if (partial) return partial.original;

    return null;
  };

  const yourParticipant = findParticipantMatch();

  const others = yourParticipant
    ? participants.filter((p) => p !== yourParticipant)
    : participants.filter((p) => normalizeName(p) !== normalizedYourName);

  let chatName = "Group Chat";
  if (participants.length === 2) {
    chatName = others[0] || participants.find((p) => p !== yourParticipant) || chatName;
  } else if (yourParticipant && others.length) {
    chatName = others.join(", ");
  }

  return {
    participants,
    messages,
    chatName,
    firstDate,
    lastDate,
    yourName: yourParticipant || null,
    enteredName: yourNameInput.trim() || null,
  };
}
