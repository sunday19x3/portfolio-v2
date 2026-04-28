type GithubRepo = { full_name: string };

type GithubCommit = {
  sha: string;
  commit: { message: string; author: { date: string } };
};

export async function GET() {
  const username = "sunday19x3";
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const reposUrl = token
    ? "https://api.github.com/user/repos?sort=pushed&per_page=10&affiliation=owner,collaborator,organization_member"
    : `https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`;

  const reposRes = await fetch(reposUrl, {
    headers,
    next: { revalidate: 300 },
  });

  if (!reposRes.ok) {
    return Response.json(
      { error: `GitHub repos ${reposRes.status}` },
      { status: 502 },
    );
  }

  const repos = (await reposRes.json()) as GithubRepo[];

  const commits = await Promise.all(
    repos.map(async (repo) => {
      const res = await fetch(
        `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&per_page=1`,
        { headers, next: { revalidate: 300 } },
      );
      if (!res.ok) return null;
      const list = (await res.json()) as GithubCommit[];
      const c = list[0];
      if (!c) return null;
      return {
        sha: c.sha,
        message: c.commit.message,
        repo: repo.full_name,
        date: c.commit.author.date,
      };
    }),
  );

  const latest = commits
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];

  if (!latest) {
    return Response.json({ error: "No commits found" }, { status: 404 });
  }

  return Response.json({
    sha: latest.sha.slice(0, 7),
    message: latest.message.split("\n")[0],
    repo: latest.repo,
    date: latest.date,
  });
}
