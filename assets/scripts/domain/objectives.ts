import type { DailyObjectiveState } from './types';

export function createEmptyDailyState(dateKey: string): DailyObjectiveState {
  return {
    dateKey,
    progress: {},
    completed: [],
  };
}

export function refreshDailyState(
  current: DailyObjectiveState,
  dateKey: string,
): DailyObjectiveState {
  if (current.dateKey === dateKey) {
    return current;
  }
  return createEmptyDailyState(dateKey);
}
