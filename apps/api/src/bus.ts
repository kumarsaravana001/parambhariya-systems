/** Tiny pub/sub for Server-Sent Events. In-process; fine for single-node. */
type Listener = (event: string, data: unknown) => void;

const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function broadcast(event: string, data: unknown) {
  for (const fn of listeners) {
    try { fn(event, data); } catch { /* a dead client must not break the loop */ }
  }
}

export function subscriberCount() {
  return listeners.size;
}
