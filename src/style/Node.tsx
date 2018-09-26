import { style, classes, keyframes } from 'typestyle';
import * as vars from './vars';

const blink = keyframes({
  '0%': {
    opacity: 0.0
  },
  '49.9%': {
    opacity: 0.0
  },
  '51.1%': {
    opacity: 1.0
  },
  '100%': {
    opacity: 1.0
  }
});

export const Node = classes(
  vars.SelectNone,
  style({
    color: vars.text,
    background: vars.bg,
    borderRadius: 5,
    fontSize: '10px',
    position: 'absolute',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  })
);
export const Selected = style({
  background: vars.selected
});
export const Invalid = style({
  background: vars.invalid
});
export const Title = style({
  pointerEvents: 'none',
  textAlign: 'center',
  padding: '15px 25px',
});
export const Name = style({
  fontWeight: 500,
  textTransform: 'unset',
  fontSize: '12px',
  display: 'flex',
  justifyContent:'center'
});
export const Type = style({
  fontWeight: 300,
  textTransform: 'uppercase'
});
export const BlinkingCursor = style({
  animationName: blink,
  animationIterationCount: 'infinite',
  animationDuration: '1s',
  width:0
});
