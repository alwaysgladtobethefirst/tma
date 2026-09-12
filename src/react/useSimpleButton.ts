import { useEffect, useRef } from 'react';
import { getWebApp } from '../web-app';
import { useButtonOwnership } from './useButtonOwnership';
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

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  });

  useButtonOwnership(ownership, name, () => {
    getWebApp()?.[name].hide();
  });

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
