/** One piece of `WebApp` state, shared by everybody reading it. */
export interface WebAppStore<T> {
  /** Hands back the teardown. Telegram is subscribed to on the first reader and let go of on the last. */
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): T | undefined;
}

/** Keeps one store per concern, so a second reader joins the first rather than starting its own. */
export interface StoreRegistry {
  get<T>(key: string, create: () => WebAppStore<T>): WebAppStore<T>;
}
