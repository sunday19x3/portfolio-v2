type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

type GraphqlResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: ContributionLevel;
              weekday: number;
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
};

const LEVEL_MAP: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export async function GET() {
  const username = "sunday19x3";
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return Response.json(
      { error: "GITHUB_TOKEN is required for contributions" },
      { status: 501 },
    );
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return Response.json(
      { error: `GitHub responded ${res.status}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as GraphqlResponse;
  const cal = data.data?.user?.contributionsCollection?.contributionCalendar;

  if (!cal) {
    return Response.json(
      { error: data.errors?.[0]?.message ?? "No contribution data" },
      { status: 502 },
    );
  }

  return Response.json({
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel],
        weekday: d.weekday,
      })),
    ),
  });
}
