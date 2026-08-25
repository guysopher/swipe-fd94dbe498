function getKvCreds() {
  const base = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { base, token };
}

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

  const { base, token } = getKvCreds();
  if (!base || !token) {
    res.status(500).json({ error: 'KV not configured yet' });
    return;
  }

  const field = `${voter}:${idx}`;
  const url = `${base}/hset/votes/${encodeURIComponent(field)}/${choice}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    res.status(502).json({ error: 'kv write failed' });
    return;
  }
  res.status(200).json({ ok: true });
}
