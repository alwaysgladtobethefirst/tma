import { useEffect } from 'react';
import { getWebApp } from '../web-app';
import { useButtonOwnership } from './useButtonOwnership';
import { useLatestRef } from './useLatestRef';
import { useTmaContext } from './useTmaContext';

type SimpleButtonName = 'BackButton' | 'SettingsButton';

/**
 * Drives one of the two buttons Telegram draws in its own header. They carry
 * no params — they are either there or not — so all there is to say is who
 * to tell when one is pressed.
 *
 * Shared by `useBackButton` and `useSettingsButton`.
 */
export function useSimpleButton(
  hookName: string,
  name: SimpleButtonName,
  onClick: () => void,
): void {
  const { ownership } = useTmaContext(hookName);

  const onClickRef = useLatestRef(onClick);

  useButtonOwnership(ownership, name, () => {
    getWebApp()?.[name].hide();
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: onClickRef is a stable ref from useLatestRef, not a value the effect should resubscribe on
  useEffect(() => {
    const button = getWebApp()?.[name];
    if (button === undefined) return;

    const handler = () => {
      onClickRef.current();
    };

    button.onClick(handler);
    button.show();

    return () => {
      button.offClick(handler);
    };
  }, [name]);
}
