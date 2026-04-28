type VercelProductionTarget = {
  url?: string;
  alias?: string[];
  createdAt?: number;
  readyState?: string;
};

type VercelProject = {
  name: string;
  targets?: { production?: VercelProductionTarget };
};

type VercelProjectsResponse = {
  projects?: VercelProject[];
};

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token) {
    return Response.json({ deployments: [] }, { status: 200 });
  }

  const url = new URL("https://api.vercel.com/v9/projects");
  if (teamId) url.searchParams.set("teamId", teamId);
  url.searchParams.set("limit", "20");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return Response.json(
      { error: `Vercel responded ${res.status}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as VercelProjectsResponse;

  const deployments = (data.projects ?? [])
    .map((p) => {
      const t = p.targets?.production;
      if (!t || !t.createdAt || t.readyState !== "READY") return null;
      const primaryAlias = t.alias?.find((a) => !a.endsWith(".vercel.app"));
      return {
        name: p.name,
        host: primaryAlias ?? t.alias?.[0] ?? t.url ?? p.name,
        createdAt: t.createdAt,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 1);

  return Response.json({ deployments });
}
