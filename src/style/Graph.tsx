import { style, classes } from 'typestyle';
import * as vars from './vars';
export const Nodes = style({
  width:0,
  height: 0,
  overflow:'visible',
  display: `flex`
});
export const Expand = style({
  position: `relative`,
  marginRight: `-100%`,
  display: `flex`,
  float: `left`,
  width: `100%`,
  height: `100%`
});
export const Inputs = style({
  display: `flex`,
  flexFlow: `column nowrap`,
  justifyContent: `center`
});
export const Outputs = style({
  marginLeft: `auto`
});
export const HelperScreen = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 48,
  fontWeight: 'bold',
  pointerEvents: 'none',
  top: 0
});
export const HelperPhrase = style({
  width: 640,
  maxWidth: '80%',
  color: vars.text,
  opacity: 0.4
});

export const SVG = classes(
  vars.SelectNone,
  style({
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    overflow:'visible'
  })
);
