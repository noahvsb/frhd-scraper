import { makeResponse } from "./makeResponse";

export const mockCdnUrl = 'https://cdn.freeriderhd.com/free_rider_hd/tracks/prd/0/ad/52143/track-data-v1.js';

export const mockAjaxJson = {
  track: {
    cdn: mockCdnUrl,
  },
  track_stats: {
    up_votes: '23.0k',
    dwn_votes: '3.7k',
    plays: '45.4m',
    runs: 8180695,
    frst_runs: '5.0m',
    avg_time: '67910:39.57',
    cmpltn_rate: 0.92
  },
};

export const mockTrackJson = {
  id: 52143,
  title: 'Strat\'s Intro',
  descr: 'Intro',
  vehicles: ['BMX', 'MTB'],
  u_id: 50110,
  author: 'strat',
  code: '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18',
};

export const mockTrackFetch = async (input: any) => {
  const url = input.toString();

  if (url.startsWith('https://www.freeriderhd.com/t/')) {
    return makeResponse({ json: () => mockAjaxJson });
  }

  if (url === mockCdnUrl) {
    return makeResponse({ text: () => `t(${JSON.stringify(mockTrackJson)})` });
  }

  throw new Error(`Unmocked fetch call: ${url}`);
}