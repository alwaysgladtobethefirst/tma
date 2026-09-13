import { warnOnce } from './warnOnce';

let nextRegistryId = 0;

/**
 * Tracks how many components under one `<TmaProvider>` are currently driving
 * the same button. Scoped to the provider instance, not kept at module
 * level: unlike the theme or viewport, which really do describe the one
 * `WebApp` a whole page shares, this is diagnostic bookkeeping about one
 * React tree — a second, unrelated provider mounted in the same test file
 * (or the same page) has no business inheriting it.
 *
 * The warning `claim` can trigger carries this registry's own id in its
 * `warnOnce` key. Without it, the warning would still be a page-wide
 * singleton even though the count behind it isn't: a real conflict in a
 * second, unrelated provider would be silently absorbed by whichever
 * provider's identical conflict happened to warn first.
 */
export function createOwnershipRegistry() {
  const registryId = nextRegistryId++;
  const owners = new Map<string, number>();

  return {
    /** Registers one more owner of `name` and reports if that makes more than one. */
    claim(name: string): number {
      const count = (owners.get(name) ?? 0) + 1;
      owners.set(name, count);

      if (count > 1) {
        warnOnce(
          `button-owners:${registryId}:${name}`,
          `Two components are driving ${name} at once, so the last one mounted wins. This is usually a screen that hasn't let go before the next one takes over.`,
        );
      }

      return count;
    },
    /** Un-registers one owner of `name` and reports how many are left. */
    release(name: string): number {
      const count = (owners.get(name) ?? 1) - 1;
      owners.set(name, count);

      return count;
    },
  };
}

export type OwnershipRegistry = ReturnType<typeof createOwnershipRegistry>;
