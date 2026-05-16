function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { title, description, type, email, _honeypot } = body;

  if (_honeypot) {
    return json({ ok: true });
  }

  if (!title || !type) {
    return json({ error: 'title and type are required' }, 400);
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;

  const label = type === 'bug' ? 'bug' : 'enhancement';

  const bodyParts = [];
  if (description) bodyParts.push(`## Description\n\n${description}`);
  bodyParts.push(
    `## Details\n\n- **Type:** ${type === 'bug' ? 'Bug report' : 'Feature request'}${email ? `\n- **Email:** ${email}` : ''}\n- **Source:** Beanie feedback form`
  );

  const ghRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.slice(0, 100),
        body: bodyParts.join('\n\n'),
        labels: [label],
      }),
    }
  );

  if (!ghRes.ok) {
    const ghBody = await ghRes.text();
    console.error(`GitHub API error ${ghRes.status}:`, ghBody);
    return json({ error: `GitHub API returned ${ghRes.status}` }, 502);
  }

  const issue = await ghRes.json();
  return json({ ok: true, url: issue.html_url }, 201);
};

export const config = { path: '/api/create-issue' };
