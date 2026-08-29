import { afterAll, beforeEach, describe, expect, it, spyOn, type Mock } from 'bun:test';
import { fetchLeaderboard, getUsers, writeLeaderboardData } from '@/leaderboard/util';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { createOptions } from '../../test-utils';
import { decompressCode } from '@/util';
import { compressedCode1, compressedCode2, mockLeaderboardFetch, mockLeaderboardJson, mockRacesJson, rawCode1, rawCode2 } from '../../mocks/leaderboard';

describe('leaderboard utils', () => {
  let fetchSpy: Mock<typeof fetch>;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch').mockImplementation(<typeof fetch> mockLeaderboardFetch);
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  describe('getUsers', () => {
    it('success', async () => {
      const result = await getUsers(52143);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);

      expect(result.get(233105)).toEqual({
        id: 233105,
        name: 'BLiu1',
        place: 1,
        time: '0:02.60',
      });

      expect(result.get(609493)).toEqual({
        id: 609493,
        name: 'FergusSchofield',
        place: 2,
        time: '0:02.60',
      });
    });
  });

  describe('fetchLeaderboard', () => {
    it('success', async () => {
      const result = await fetchLeaderboard(52143, createOptions());

      expect(result).toEqual({
        id: 52143,
        leaderboard: [
          {
            user: { id: 233105, name: 'BLiu1', place: 1, time: '0:02.60' },
            race: {
              vehicle: 'MTB',
              desktop: true,
              runTicks: 78,
              code: expect.any(String),
              compressed: true,
            },
          },
          {
            user: { id: 609493, name: 'FergusSchofield', place: 2, time: '0:02.60' },
            race: {
              vehicle: 'MTB',
              desktop: true,
              runTicks: 78,
              code: expect.any(String),
              compressed: true,
            },
          },
        ],
      });

      expect(decompressCode(result.leaderboard[0].race.code)).resolves.toEqual(rawCode1);
      expect(decompressCode(result.leaderboard[1].race.code)).resolves.toEqual(rawCode2);
    });

    it('success without compression', async () => {
      const result = await fetchLeaderboard(52143, createOptions({ compress: false }));

      expect(result).toEqual({
        id: 52143,
        leaderboard: [
          {
            user: { id: 233105, name: 'BLiu1', place: 1, time: '0:02.60' },
            race: {
              vehicle: 'MTB',
              desktop: true,
              runTicks: 78,
              code: rawCode1,
              compressed: false,
            },
          },
          {
            user: { id: 609493, name: 'FergusSchofield', place: 2, time: '0:02.60' },
            race: {
              vehicle: 'MTB',
              desktop: true,
              runTicks: 78,
              code: rawCode2,
              compressed: false,
            },
          },
        ],
      });
    });
  });

  describe('writeLeaderboardData', () => {
    const mockLeaderboardData = {
      id: 52143,
      leaderboard: [
        {
          user: { id: 233105, name: 'BLiu1', place: 1, time: '0:02.60' },
          race: {
            vehicle: 'MTB',
            desktop: true,
            runTicks: 78,
            code: compressedCode1,
            compressed: true,
          },
        },
        {
          user: { id: 609493, name: 'FergusSchofield', place: 2, time: '0:02.60' },
          race: {
            vehicle: 'MTB',
            desktop: true,
            runTicks: 78,
            code: compressedCode2,
            compressed: true,
          },
        },
      ],
    };

    it('writes mock leaderboard data', async () => {
      const options = createOptions({ path: 'test/data/leaderboard' });

      await mkdir(options.path, { recursive: true });

      await writeLeaderboardData(mockLeaderboardData, options);

      const written = await readFile(`${options.path}/52143.json`, 'utf-8');
      expect(JSON.parse(written)).toEqual(mockLeaderboardData);

      // clean up
      await rm(options.path, { recursive: true });
    });
  });
});