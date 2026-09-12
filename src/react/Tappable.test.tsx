// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installWebApp } from '../../test/web-app-stub';
import { Tappable } from './Tappable';
import { TmaProvider } from './TmaProvider';

function installHaptics() {
  const HapticFeedback = {
    impactOccurred: vi.fn(),
    notificationOccurred: vi.fn(),
    selectionChanged: vi.fn(),
  };
  installWebApp({ HapticFeedback } as never);

  return HapticFeedback;
}

function placeAt(element: HTMLElement, rect: { left: number; top: number }) {
  element.getBoundingClientRect = () =>
    ({
      left: rect.left,
      top: rect.top,
      right: rect.left + 100,
      bottom: rect.top + 40,
      width: 100,
      height: 40,
      x: rect.left,
      y: rect.top,
    }) as DOMRect;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Tappable', () => {
  it('adds nothing of its own to the DOM', () => {
    installHaptics();

    const { container } = render(
      <TmaProvider>
        <Tappable>
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild?.tagName).toBe('BUTTON');
  });

  it('marks the child pressed while the finger is down, and lets go on release', () => {
    installHaptics();
    render(
      <TmaProvider>
        <Tappable>
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(button.hasAttribute('data-pressed')).toBe(true);

    fireEvent.pointerUp(button, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(button.hasAttribute('data-pressed')).toBe(false);
  });

  it('gives a selection haptic on press by default', () => {
    const haptics = installHaptics();
    render(
      <TmaProvider>
        <Tappable>
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(haptics.selectionChanged).toHaveBeenCalledOnce();
    expect(haptics.impactOccurred).not.toHaveBeenCalled();
  });

  it('gives the impact asked for instead', () => {
    const haptics = installHaptics();
    render(
      <TmaProvider>
        <Tappable haptic="heavy">
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(haptics.impactOccurred).toHaveBeenCalledWith('heavy');
    expect(haptics.selectionChanged).not.toHaveBeenCalled();
  });

  it('stays silent when the haptic is turned off, but still tracks the press', () => {
    const haptics = installHaptics();
    render(
      <TmaProvider>
        <Tappable haptic={false}>
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(haptics.selectionChanged).not.toHaveBeenCalled();
    expect(button.hasAttribute('data-pressed')).toBe(true);
  });

  it('lets go when the finger slides off, and takes it back when it returns', () => {
    installHaptics();
    render(
      <TmaProvider>
        <Tappable>
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 500, clientY: 500 });
    expect(button.hasAttribute('data-pressed')).toBe(false);

    fireEvent.pointerMove(button, { pointerId: 1, clientX: 20, clientY: 20 });
    expect(button.hasAttribute('data-pressed')).toBe(true);
  });

  it('lets go when the gesture is cancelled, as a scroll does', () => {
    installHaptics();
    render(
      <TmaProvider>
        <Tappable>
          <button type="button">Tap</button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerCancel(button, { pointerId: 1 });

    expect(button.hasAttribute('data-pressed')).toBe(false);
  });

  it('stays out of the way when the child is disabled', () => {
    const haptics = installHaptics();
    render(
      <TmaProvider>
        <Tappable>
          <button type="button" disabled>
            Tap
          </button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(haptics.selectionChanged).not.toHaveBeenCalled();
    expect(button.hasAttribute('data-pressed')).toBe(false);
  });

  it('works with no provider above it, unlike every hook in this layer', () => {
    const haptics = installHaptics();

    const { container } = render(
      <Tappable>
        <button type="button">Tap</button>
      </Tappable>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });
    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(haptics.selectionChanged).toHaveBeenCalledOnce();
    expect(button.hasAttribute('data-pressed')).toBe(true);
    expect(container.children).toHaveLength(1);
  });

  it('keeps the handlers the child already had', () => {
    installHaptics();
    const onPointerDown = vi.fn();
    render(
      <TmaProvider>
        <Tappable>
          <button type="button" onPointerDown={onPointerDown}>
            Tap
          </button>
        </Tappable>
      </TmaProvider>,
    );
    const button = screen.getByRole('button');
    placeAt(button, { left: 0, top: 0 });

    fireEvent.pointerDown(button, { pointerId: 1, clientX: 10, clientY: 10 });

    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(button.hasAttribute('data-pressed')).toBe(true);
  });
});
