import { useEffect } from 'react';
import { getWebApp } from '../web-app';
import type { BottomButton, BottomButtonParams, BottomButtonPosition } from '../web-app.types';
import type { BottomButtonOptions } from './useBottomButton.types';
import { useButtonOwnership } from './useButtonOwnership';
import { useLatestRef } from './useLatestRef';
import { useTmaContext } from './useTmaContext';

type BottomButtonName = 'MainButton' | 'SecondaryButton';

function selectButton(name: BottomButtonName): BottomButton | undefined {
  return getWebApp()?.[name];
}

function toBottomButtonParams(options: {
  text: string;
  color?: string;
  textColor?: string;
  isActive: boolean;
  hasShineEffect?: boolean;
  position?: BottomButtonPosition;
}): BottomButtonParams {
  const { text, color, textColor, isActive, hasShineEffect, position } = options;

  return {
    text,
    is_visible: true,
    is_active: isActive,
    ...(color !== undefined && { color }),
    ...(textColor !== undefined && { text_color: textColor }),
    ...(hasShineEffect !== undefined && { has_shine_effect: hasShineEffect }),
    ...(position !== undefined && { position }),
  };
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
  const { ownership } = useTmaContext(hookName);

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

  const onClickRef = useLatestRef(onClick);

  useButtonOwnership(ownership, name, () => {
    selectButton(name)?.hide();
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: onClickRef is a stable ref from useLatestRef, not a value the effect should resubscribe on
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

    button.setParams(
      toBottomButtonParams({ text, color, textColor, isActive, hasShineEffect, position }),
    );

    // is_active in setParams only seems to drive the dimmed look on some
    // clients — taps still reach onClick with it alone, so the imperative
    // enable/disable pair is what actually blocks the press
    if (isActive) {
      button.enable();
    } else {
      button.disable();
    }

    if (isProgressVisible) {
      button.showProgress();
    } else {
      button.hideProgress();
    }
  }, [name, text, color, textColor, isActive, hasShineEffect, isProgressVisible, position]);
}
