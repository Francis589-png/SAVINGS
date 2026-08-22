export type RewardEvent = { id: string; type: 'saving' | 'race' | 'finish' | 'coin'; points: number; createdAt: string };

export const REWARD_RULES = {
  saving: 10,
  race: 5,
  finish: 25,
  coin: 1,
} as const;

export function rewardFor(type: keyof typeof REWARD_RULES, amount = 1) {
  return REWARD_RULES[type] * Math.max(1, Math.floor(amount));
}

export function rewardLevel(points: number) {
  return Math.floor(Math.max(0, points) / 100) + 1;
}

export function pointsToNextLevel(points: number) {
  const level = rewardLevel(points);
  return level * 100 - Math.max(0, points);
}
