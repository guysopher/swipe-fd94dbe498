export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { voter, idx, choice } = req.body || {};
  if (!voter || !idx || (choice !== 'like' && choice !== 'pass')) {
    res.status(400).json({ error: 'bad request' });
    return;
  }

  const field = `${voter}:${idx}`;
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!base || !token) {
    res.status(500).json({ error: 'KV not configured yet' });
    return;
  }

  const url = `${base}/hset/votes/${encodeURIComponent(field)}/${choice}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    res.status(502).json({ error: 'kv write failed' });
    return;
  }
  res.status(200).json({ ok: true });
}
