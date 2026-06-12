// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pill, STATUS_MAP } from '../Pill';

describe('Pill', () => {
  it('renders Approved with ok tone', () => {
    const { container } = render(<Pill status="Approved" />);
    expect(screen.getByText('Approved')).toBeTruthy();
    expect(container.firstChild).toHaveProperty('className', expect.stringContaining('ok'));
  });

  it('renders Proofing with info tone', () => {
    const { container } = render(<Pill status="Proofing" />);
    expect(screen.getByText('Proofing')).toBeTruthy();
    expect(container.firstChild).toHaveProperty('className', expect.stringContaining('info'));
  });

  it('tone prop overrides STATUS_MAP tone', () => {
    const { container } = render(<Pill status="Approved" tone="warn" />);
    expect(container.firstChild).toHaveProperty('className', expect.stringContaining('warn'));
    expect(container.firstChild).not.toHaveProperty('className', expect.stringContaining('ok'));
  });

  it('empty-string tone override suppresses STATUS_MAP tone', () => {
    const { container } = render(<Pill status="Proofing" tone="" />);
    const classList = (container.firstChild as HTMLElement).className;
    expect(classList).not.toContain('info');
  });

  it('renders dot when dot=true', () => {
    const { container } = render(<Pill status="Pending" dot={true} />);
    const dots = container.querySelectorAll('.dot');
    expect(dots.length).toBe(1);
  });

  it('uses label prop over STATUS_MAP label', () => {
    render(<Pill status="Approved" label="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeTruthy();
  });

  it('falls back to status string when not in STATUS_MAP', () => {
    render(<Pill status="UnknownStatus" />);
    expect(screen.getByText('UnknownStatus')).toBeTruthy();
  });

  it('STATUS_MAP contains Approved and Proofing entries', () => {
    expect(STATUS_MAP['Approved']).toEqual({ label: 'Approved', tone: 'ok' });
    expect(STATUS_MAP['Proofing']).toEqual({ label: 'Proofing', tone: 'info' });
  });
});
