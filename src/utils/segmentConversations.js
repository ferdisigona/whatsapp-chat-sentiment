// utils/segmentConversations.js
export function segmentByGapMinutes(messages, gapMinutes = 60) {
  if (!messages?.length) return [];

  const gapMs = gapMinutes * 60 * 1000;
  const segments = [];
  let current = [messages[0]];

  const parseDateTime = (m) =>
    new Date(`${m.date} ${m.time}`.replace(/\u202F/g, " "));

  for (let i = 1; i < messages.length; i++) {
    const prev = parseDateTime(messages[i - 1]);
    const curr = parseDateTime(messages[i]);
    if (curr - prev > gapMs) {
      segments.push(current);
      current = [];
    }
    current.push(messages[i]);
  }
  segments.push(current);
  return segments;
}

export function segmentConversations(messages, gapMinutes = 60) {
  return segmentByGapMinutes(messages, gapMinutes);
}

export function segmentByGap(messages, gapHours = 4) {
  return segmentByGapMinutes(messages, gapHours * 60);
}

export default segmentConversations;