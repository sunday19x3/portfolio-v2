type SearchCommitItem = {
  sha: string;
  commit: { message: string; author: { date: string } };
  repository: { full_name: string };
};

type SearchCommitsResponse = {
  items?: SearchCommitItem[];
};

export async function GET() {
  const username = "sunday19x3";
  const token = process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    // search/commits previews ship under cloak-preview historically; the modern
    // accept type returns the same shape and is what GitHub recommends now.
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `https://api.github.com/search/commits?q=author:${encodeURIComponent(
    username,
  )}&sort=author-date&order=desc&per_page=1`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return Response.json(
      { error: `GitHub responded ${res.status}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as SearchCommitsResponse;
  const c = data.items?.[0];

  if (!c) {
    return Response.json({ error: "No commits found" }, { status: 404 });
  }

  return Response.json({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split("\n")[0],
    repo: c.repository.full_name,
    date: c.commit.author.date,
  });
}
