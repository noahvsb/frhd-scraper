import { checkResponse, Options } from "@/util";
import { writeFile } from "node:fs/promises";

const leaderboardUrl = (_id: number): string => `https://www.freeriderhd.com/track_api/load_leaderboard`;
const leaderboardBody = (id: number): RequestInit => ({
  method: "POST",
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `t_id=${id}`,
});
const racesUrl = (_id: number): string => `https://www.freeriderhd.com/track_api/load_races`;
const racesBody = (id: number, uids: number[]): RequestInit => ({
  method: "POST",
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `t_id=${id}&u_ids=${uids.join(',')}`,
});

type LeaderboardData = {
  id: number,
  leaderboard: {
    user: UserData,
    race: RaceData,
  }[],
}

type UserData = {
  id: number,
  name: string,
  place: number,
  time: string,
}

type RaceData = {
  vehicle: string,
  desktop: boolean,
  runTicks: number,
  code: string,
  compressed: boolean,
}

type LeaderboardEntry = {
  u_id: number;
  desktop: boolean;
  run_time: string;
  place: number;
  user: {
    u_id: number;
    u_name: string;
    d_name: string;
    d_name_short: string;
    img_url_small: string;
  };
}

export async function getUidsAndPlaces(id: number): Promise<UserData[]> {
  const res = await fetch(leaderboardUrl(id), leaderboardBody(id));
  checkResponse(res);
  const data = (await res.json()).track_leaderboard;
  return data
    .filter((entry: LeaderboardEntry) => entry.user)
    .map((entry: LeaderboardEntry) => ({
      id: entry.u_id,
      name: entry.user.d_name,
      place: entry.place,
      time: entry.run_time,
    }));
}

export async function fetchLeaderboard(id: number, options: Options): Promise<LeaderboardData> {
  const uidsPlaces = await getUidsAndPlaces(id);

  const uids = uidsPlaces.map(({id}) => id);
  
  const res = await fetch(racesUrl(id), racesBody(id, uids));
  checkResponse(res);

  const data = (await res.json()).data;

  // TODO

  return <any>{};
}

export async function writeLeaderboardData(data: LeaderboardData, options: Options): Promise<void> {
  await writeFile(`${options.path}/${data.id}.json`, JSON.stringify(data));
}

export async function scrapeLeaderboard(id: number, options: Options): Promise<void> {
  const leaderboard = await fetchLeaderboard(id, options);
}