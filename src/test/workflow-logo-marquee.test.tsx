import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowLogoMarquee } from '@/components/workflow-logo-marquee';

describe('homepage first-party logo marquee', () => {
  it('renders two continuous rows, each duplicated only for visual animation', () => {
    const { container } = render(<WorkflowLogoMarquee lang="en" />);
    const rows = container.querySelectorAll('.tle-logo-row');
    expect(rows).toHaveLength(2);
    expect(rows[1].classList.contains('tle-logo-row--reverse')).toBe(true);
    rows.forEach(row => {
      expect(row.querySelectorAll('.tle-wordmark-group')).toHaveLength(2);
      expect(row.querySelectorAll('.tle-wordmark-group[aria-hidden="true"]')).toHaveLength(1);
      const [original, duplicate] = Array.from(row.querySelectorAll('.tle-wordmark-group'));
      expect(original.textContent).toBe(duplicate.textContent);
      expect(row.getAttribute('role')).toBe('img');
      const words = Array.from(original.querySelectorAll('.tle-wordmark')).map(node => node.textContent);
      expect(row.getAttribute('aria-label')).toBe(words.join(', '));
    });
    expect(screen.getByRole('heading', { name: 'ONE CONNECTED EXPERIENCE' })).toBeTruthy();
  });

  it('localizes all labels in Spanish while keeping the same paired rows', () => {
    const { container } = render(<WorkflowLogoMarquee lang="es" />);
    expect(screen.getByRole('heading', { name: 'UNA EXPERIENCIA MÁS CONECTADA' })).toBeTruthy();
    expect(container.querySelector('.tle-logo-row[aria-label]')?.getAttribute('aria-label')).toContain('Asistentes de IA');
    expect(container.querySelector('.tle-logo-row--reverse')?.getAttribute('aria-label')).toContain('Cotizaciones y facturas');
    expect(container.querySelectorAll('.tle-wordmark-group[aria-hidden="true"]')).toHaveLength(2);
  });
});
