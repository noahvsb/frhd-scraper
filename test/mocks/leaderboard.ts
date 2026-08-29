import { makeResponse } from "./makeResponse";

export const mockLeaderboardJson = {
  track_leaderboard: [
    {
      u_id: 233105,
      desktop: true,
      run_time: '0:02.60',
      place: 1,
      user: {
        u_id: 233105,
        u_name: 'bliu1',
        d_name: 'BLiu1',
        d_name_short: 'BLiu1',
        img_url_small: 'https://www.gravatar.com/avatar/mock1',
      },
    },
    {
      u_id: 609493,
      desktop: true,
      run_time: '0:02.60',
      place: 2,
      user: {
        u_id: 609493,
        u_name: 'fergusschofield',
        d_name: 'FergusSchofield',
        d_name_short: 'FergusSchofield',
        img_url_small: 'https://www.gravatar.com/avatar/mock2',
      },
    },
  ],
};

export const rawCode1 = '{"up_down":[0],"left_down":[66],"left_up":[74]}';
export const rawCode2 = '{"up_down":[0],"left_down":[71]}';

export const compressedCode1 = 'H4sIAAAAAAAAA6tWKi2IT8kvz1OyijaI1VHKSU0rgfHNDGACpQVKVtHmJrG1AEBiD1AvAAAA';
export const compressedCode2 = 'H4sIAAAAAAAAA6tWKi2IT8kvz1OyijaI1VHKSU0rgfHNDWNrAbZEHo0gAAAA';

export const mockRacesJson = {
  data: [
    {
      user: {
        u_id: 233105,
        u_name: 'bliu1',
        d_name: 'BLiu1',
        img_url_small: 'https://www.gravatar.com/avatar/mock1',
        cosmetics: {},
      },
      race: {
        code: rawCode1,
        vehicle: 'MTB',
        desktop: true,
        run_ticks: 78,
      },
    },
    {
      user: {
        u_id: 609493,
        u_name: 'fergusschofield',
        d_name: 'FergusSchofield',
        img_url_small: 'https://www.gravatar.com/avatar/mock2',
        cosmetics: {},
      },
      race: {
        code: rawCode2,
        vehicle: 'MTB',
        desktop: true,
        run_ticks: 78,
      },
    },
  ],
};

export const mockLeaderboardFetch = async (input: any) => {
  const url = input.toString();

  if (url === 'https://www.freeriderhd.com/track_api/load_leaderboard') {
    return makeResponse({ json: () => mockLeaderboardJson });
  }

  if (url === 'https://www.freeriderhd.com/track_api/load_races') {
    return makeResponse({ json: () => mockRacesJson });
  }

  throw new Error(`Unmocked fetch call: ${url}`);
}