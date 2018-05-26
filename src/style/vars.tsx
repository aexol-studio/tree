import { style } from 'typestyle';

export const transition = 'all 0.25s;'
export const off = '#eeeeff';
export const bg = '#333';
export const bgradial = '#555';
export const text = '#ddd';
export const selected = '#0AE';
export const input = '#ae0';
export const dot = '12px';
export const portDot = style({
  background: 'transparent',
  borderWidth: '2px',
  borderColor:off,
  borderStyle:'solid',
  borderRadius: '100%',
  cursor: 'pointer'
});
