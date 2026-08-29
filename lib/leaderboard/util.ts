import { checkResponse, compressCode, Options } from "@/util";
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

type RaceEntry = {
  user: {
    u_id: number;
    u_name: string;
    d_name: string;
    img_url_small: string;
    cosmetics: unknown;
  };
  race: {
    code: string;
    vehicle: string;
    desktop: boolean;
    run_ticks: number;
  };
}

export async function getUsers(id: number): Promise<Map<number, UserData>> {
  const res = await fetch(leaderboardUrl(id), leaderboardBody(id));
  checkResponse(res);
  const data = (await res.json()).track_leaderboard;
  return new Map(
    data
      .filter((entry: LeaderboardEntry) => entry.user)
      .map((entry: LeaderboardEntry): [number, UserData] => [
        entry.u_id,
        {
          id: entry.u_id,
          name: entry.user.d_name,
          place: entry.place,
          time: entry.run_time,
        },
      ])
  );
}

export async function fetchLeaderboard(id: number, options: Options): Promise<LeaderboardData> {
  const users = await getUsers(id);

  const res = await fetch(racesUrl(id), racesBody(id, [ ...users.keys() ]));
  checkResponse(res);

  const data: RaceEntry[] = (await res.json()).data;

  const leaderboard = await Promise.all(
    data.map(async (entry) => {
      const user = users.get(entry.user.u_id)!;

      let maybeCompressed = entry.race.code;
      if (options.compress) {
        maybeCompressed = await compressCode(maybeCompressed);
      }

      const race: RaceData = {
        vehicle: entry.race.vehicle,
        desktop: entry.race.desktop,
        runTicks: entry.race.run_ticks,
        code: maybeCompressed,
        compressed: Boolean(options.compress),
      };

      return { user, race };
    })
  );

  return { id, leaderboard };
}

export async function writeLeaderboardData(data: LeaderboardData, options: Options): Promise<void> {
  await writeFile(`${options.path}/${data.id}.json`, JSON.stringify(data));
}

export async function scrapeLeaderboard(id: number, options: Options): Promise<void> {
  const leaderboard = await fetchLeaderboard(id, options);
  await writeLeaderboardData(leaderboard, options);
}