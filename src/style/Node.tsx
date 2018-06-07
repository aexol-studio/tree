import { style } from 'typestyle';
import * as vars from './vars';
export const Node = style({
  color: vars.text,
  background: vars.bg,
  borderRadius: 5,
  fontSize: '10px',
  position: 'absolute',
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center'
});
export const Selected = style({
  background: vars.selected
});
export const Title = style({
  pointerEvents: 'none',
  userSelect: 'none',
  "-moz-user-select":'none',
  textAlign: 'center',
  padding: '15px 25px'
});
export const Name = style({
  fontWeight: 500,
  textTransform: 'unset',
  fontSize: '12px'
});
export const Type = style({
  fontWeight: 300,
  textTransform: 'uppercase',
});
