import type { RoomAnchor } from '../domain/types';

export type GameEventMap = {
  'pet:updated': { petId: string };
  'inventory:changed': { reason: string };
  'currency:changed': { coins: number };
  'room:changed': { placements: Partial<Record<RoomAnchor, string>> };
};

type Handler<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

export class EventBus {
  private readonly listeners: {
    [K in keyof GameEventMap]?: Array<Handler<K>>;
  } = {};

  on<K extends keyof GameEventMap>(event: K, handler: Handler<K>): () => void {
    const list = (this.listeners[event] ?? []) as Array<Handler<K>>;
    list.push(handler);
    this.listeners[event] = list as (typeof this.listeners)[K];
    return () => {
      const index = list.indexOf(handler);
      if (index >= 0) {
        list.splice(index, 1);
      }
    };
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const list = this.listeners[event] as Array<Handler<K>> | undefined;
    if (!list) {
      return;
    }
    for (const handler of [...list]) {
      handler(payload);
    }
  }
}

export const gameEvents = new EventBus();
