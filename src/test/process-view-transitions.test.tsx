import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProcessSteps } from '@/components/process-view-transitions';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
  Object.defineProperty(document, 'startViewTransition', { configurable: true, value: undefined });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.style.overflow = '';
});

describe('The Launch Era shared-element process cards', () => {
  it('pairs each step with a different relevant first-party photo, including the expanded view', () => {
    const expected = [
      '/assets/bundle-landing/bundle-booking.png',
      '/assets/bundle-landing/bundle-hero.png',
      '/assets/bundle-landing/bundle-command.png'
    ];
    for (const [index, path] of expected.entries()) {
      const view = render(<ProcessSteps lang="en"/>);
      const button = screen.getAllByRole('button', { name: /Explore step/ })[index];
      expect(button.querySelector('img')?.getAttribute('src')).toBe(path);
      fireEvent.click(button);
      const photo = screen.getByRole('dialog').querySelector('.tle-process-detail-photo') as HTMLImageElement;
      expect(photo.getAttribute('src')).toBe(path);
      expect(photo.alt.toLowerCase()).toContain('cleaning business owners');
      fireEvent.click(screen.getByRole('button', { name: 'Close step details' }));
      view.unmount();
    }
    render(<ProcessSteps lang="es"/>);
    fireEvent.click(screen.getByRole('button', { name: /Explorar paso 02/ }));
    const spanishPhoto = screen.getByRole('dialog').querySelector('.tle-process-detail-photo') as HTMLImageElement;
    expect(spanishPhoto.alt).toMatch(/Dueñas de un negocio de limpieza/);
  });

  it('opens details and restores keyboard focus without changing the contact flow', () => {
    render(<ProcessSteps lang="en"/>);
    const steps = screen.getAllByRole('button', { name: /Explore step/ });
    expect(steps).toHaveLength(3);
    fireEvent.click(steps[0]);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('WHAT TO EXPECT')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(steps[0]);
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps the same experience and copy in Spanish', () => {
    render(<ProcessSteps lang="es"/>);
    fireEvent.click(screen.getByRole('button', { name: /Explorar paso 02/ }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('QUÉ PUEDES ESPERAR')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalles del paso' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('uses the unique matching view-transition-name on either side of the morph', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true, value: vi.fn(() => ({ matches: false }))
    });
    const startViewTransition = vi.fn((update: () => void) => {
      update();
      return { finished: Promise.resolve() };
    });
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true, value: startViewTransition
    });
    render(<ProcessSteps lang="en"/>);
    const button = screen.getByRole('button', { name: /Explore step 03/ });
    fireEvent.click(button);
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    // JSDOM may not serialize this newer CSS property in the style attribute,
    // even when React correctly assigns its DOM style property.
    const hero = document.querySelector<HTMLElement>('.tle-process-detail-hero');
    expect(hero?.style.viewTransitionName).toBe('tle-process-2');
    const visibleNames = [...document.querySelectorAll<HTMLElement>('.tle-process-thumbnail, .tle-process-detail-hero')]
      .map(node => node.style.viewTransitionName).filter(name => name && name !== 'none');
    expect(visibleNames).toEqual(['tle-process-2']);
    fireEvent.click(screen.getByRole('button', { name: 'Close step details' }));
    await waitFor(() => expect(startViewTransition).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
