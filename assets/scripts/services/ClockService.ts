export const clock = {
  now(): number {
    return Date.now();
  },

  todayKey(now: number = Date.now()): string {
    const date = new Date(now);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
};
