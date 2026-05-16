const ALLOWED_ORIGIN = 'https://tinybiglabs.com';
const MAX_TITLE = 100;
const MAX_DESCRIPTION = 5000;
const MAX_EMAIL = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (req.headers.get('origin') !== ALLOWED_ORIGIN) {
    return json({ error: 'Forbidden' }, 403);
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

  if (!['bug', 'enhancement'].includes(type)) {
    return json({ error: 'Invalid type' }, 400);
  }

  if (!title || title.length > MAX_TITLE) {
    return json({ error: 'Title is required and must be under 100 characters' }, 400);
  }

  if (description && description.length > MAX_DESCRIPTION) {
    return json({ error: 'Description must be under 5,000 characters' }, 400);
  }

  if (email && (email.length > MAX_EMAIL || !EMAIL_RE.test(email))) {
    return json({ error: 'Invalid email address' }, 400);
  }

  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
  const label = type === 'bug' ? 'bug' : 'enhancement';

  const bodyParts = [];
  if (description) {
    // Fenced code block prevents Markdown injection from user content
    bodyParts.push(`## Description\n\n\`\`\`\n${description.replace(/`/g, "'")}\n\`\`\``);
  }
  bodyParts.push(
    `## Details\n\n- **Type:** ${type === 'bug' ? 'Bug report' : 'Feature request'}${email ? `\n- **Email:** ${email}` : ''}\n- **Source:** Beanie feedback form`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let ghRes;
  try {
    ghRes = await fetch(
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
          title: title.trim(),
          body: bodyParts.join('\n\n'),
          labels: [label],
        }),
        signal: controller.signal,
      }
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      return json({ error: 'Request timed out' }, 504);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!ghRes.ok) {
    console.error(`GitHub API error ${ghRes.status}:`, await ghRes.text());
    return json({ error: 'Failed to create issue' }, 502);
  }

  const issue = await ghRes.json();
  return json({ ok: true, url: issue.html_url }, 201);
};

export const config = { path: '/api/create-issue' };
