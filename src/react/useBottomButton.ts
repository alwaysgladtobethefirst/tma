import { useEffect, useRef } from 'react';
import { getWebApp } from '../web-app';
import type { BottomButton, BottomButtonPosition } from '../web-app.types';
import type { BottomButtonOptions } from './useBottomButton.types';
import { useButtonOwnership } from './useButtonOwnership';
import { useTmaContext } from './useTmaContext';

type BottomButtonName = 'MainButton' | 'SecondaryButton';

function selectButton(name: BottomButtonName): BottomButton | undefined {
  return getWebApp()?.[name];
}

/**
 * Drives one of the two buttons Telegram draws at the bottom. Shared by
 * `useMainButton` and `useSecondaryButton`, which differ only in which
 * button they name and whether `position` means anything.
 *
 * The click handler lives in a ref, so passing an inline arrow doesn't tear
 * the subscription down and rebuild it on every render — params change far
 * more often than the fact that somebody is listening.
 */
export function useBottomButton(
  hookName: string,
  name: BottomButtonName,
  options: BottomButtonOptions & { position?: BottomButtonPosition },
): void {
  useTmaContext(hookName);

  const {
    text,
    onClick,
    color,
    textColor,
    isActive = true,
    hasShineEffect,
    isProgressVisible = false,
    position,
  } = options;

  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  });

  useButtonOwnership(name, () => {
    selectButton(name)?.hide();
  });

  useEffect(() => {
    const button = selectButton(name);
    if (button === undefined) return;

    const handler = () => {
      onClickRef.current();
    };

    button.onClick(handler);
    return () => {
      button.offClick(handler);
    };
  }, [name]);

  useEffect(() => {
    const button = selectButton(name);
    if (button === undefined) return;

    button.setParams({
      text,
      is_visible: true,
      is_active: isActive,
      ...(color !== undefined && { color }),
      ...(textColor !== undefined && { text_color: textColor }),
      ...(hasShineEffect !== undefined && { has_shine_effect: hasShineEffect }),
      ...(position !== undefined && { position }),
    });

    if (isProgressVisible) {
      button.showProgress();
    } else {
      button.hideProgress();
    }
  }, [name, text, color, textColor, isActive, hasShineEffect, isProgressVisible, position]);
}
