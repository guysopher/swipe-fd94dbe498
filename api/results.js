export default async function handler(req, res) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!base || !token) {
    res.status(500).json({ error: 'KV not configured yet' });
    return;
  }

  const url = `${base}/hgetall/votes`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    res.status(502).json({ error: 'kv read failed' });
    return;
  }
  const data = await r.json();
  const flat = data.result || [];

  const tally = {};
  const voters = new Set();
  for (let i = 0; i < flat.length; i += 2) {
    const sep = flat[i].lastIndexOf(':');
    const voter = flat[i].slice(0, sep);
    const idx = flat[i].slice(sep + 1);
    const choice = flat[i + 1];
    voters.add(voter);
    if (!tally[idx]) tally[idx] = { likes: [], passes: [] };
    tally[idx][choice === 'like' ? 'likes' : 'passes'].push(voter);
  }

  res.status(200).json({ voters: [...voters], tally });
}
