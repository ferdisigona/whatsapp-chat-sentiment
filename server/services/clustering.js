import { embedText } from "./embeddings.js";

function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function averageVectors(vectors) {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const out = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) {
      out[i] += v[i];
    }
  }
  for (let i = 0; i < dim; i++) {
    out[i] /= vectors.length;
  }
  return out;
}

export async function clusterSegments(segments, options = {}) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return [];
  }

  const {
    similarityThreshold = 0.8,
    embeddingOptions,
  } = options;

  const embedded = [];
  for (const seg of segments) {
    const summaryText = seg.summary && seg.summary.trim().length > 0
      ? seg.summary
      : "Short chat";
    const embedding = await embedText(summaryText, embeddingOptions);
    embedded.push({ ...seg, embedding });
  }

  const clusters = [];

  for (const item of embedded) {
    let bestCluster = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const sim = cosineSimilarity(item.embedding, cluster.centroid);
      if (sim > bestScore) {
        bestScore = sim;
        bestCluster = cluster;
      }
    }

    if (bestCluster && bestScore >= similarityThreshold) {
      bestCluster.items.push(item);
      bestCluster.centroid = averageVectors(
        bestCluster.items.map((it) => it.embedding)
      );
    } else {
      clusters.push({
        items: [item],
        centroid: item.embedding,
      });
    }
  }

  return clusters.map((cluster, idx) => {
    const nameSource = cluster.items[0].summary || "Conversation group";
    return {
      name: `Theme ${idx + 1} — ${nameSource.slice(0, 40)}...`,
      segmentIds: cluster.items.map((it) => it.id),
      moodCounts: cluster.items.reduce((acc, it) => {
        const mood = it.mood || "unknown";
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {}),
    };
  });
}

