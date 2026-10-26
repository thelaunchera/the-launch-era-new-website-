import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, render, screen} from '@testing-library/react';
import {SmartWelcomeBundle} from '../components/smart-welcome-bundle';

describe('Promotion and privacy choices',()=>{
 beforeEach(()=>{
  vi.useFakeTimers();sessionStorage.clear();
  document.documentElement.removeAttribute('data-privacy-pending');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({percent_off:40,plans:{'ai-booking':{}}})}));
 });
 afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();document.documentElement.removeAttribute('data-privacy-pending');});
 async function pricing(){await act(async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();});}
 it('keeps the promotion inline while a visitor is making a privacy choice',async()=>{
  document.documentElement.setAttribute('data-privacy-pending','');render(<SmartWelcomeBundle/>);await pricing();
  await act(async()=>{vi.advanceTimersByTime(2000);});
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('link',{name:/Explore the bundle/})).toBeTruthy();
 });
 it('preserves the existing promotion for a visitor without a pending privacy choice',async()=>{
  render(<SmartWelcomeBundle/>);await pricing();await act(async()=>{vi.advanceTimersByTime(1200);});
  expect(screen.getByRole('dialog')).toBeTruthy();
 });
 it('does not open a queued promotion over a newly opened privacy panel',async()=>{
  render(<SmartWelcomeBundle/>);await pricing();document.documentElement.setAttribute('data-privacy-pending','');
  await act(async()=>{vi.advanceTimersByTime(1200);});expect(screen.queryByRole('dialog')).toBeNull();
 });
});
