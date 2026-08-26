import { checkResponse, Options } from "@/util";

const leaderbordUrl = (_id: number): string => `https://www.freeriderhd.com/track_api/load_leaderboard`;
const leaderbordBody = (id: number): RequestInit => ({
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: `t_id=${id}`
});

type LeaderboardData = {
  // TODO
}

export async function fetchLeaderboard(id: number): Promise<LeaderboardData> {
  const res = await fetch(leaderbordUrl(id), leaderbordBody(id));
  checkResponse(res);

  const data = await res.json();

  // TODO

  console.log(data);

  return {};
}

export async function scrapeLeaderboard(id: number, options: Options): Promise<void> {
  // TODO
}