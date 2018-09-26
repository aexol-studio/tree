import { style, classes } from 'typestyle';
import * as vars from './vars';

export const Port = style({
  display: `flex`,
  flexDirection: `row`,
  justifyContent: `flex-end`,
  alignItems: `center`,
  padding: `5px 0`
});
export const Name = style({
  padding: `5px`,
  textAlign: `center`,
  pointerEvents: `none`,
  userSelect: `none`,
  fontWeight: `bold`,
  color: `${vars.off}`,
  fontSize: `10px`
});
export const DotWrapper = style({
  width: vars.dot * 2,
  height: vars.dot * 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});
export const Dot = classes(
  vars.portDot,
  vars.SelectNone,
  style({
    width: vars.dot,
    height: vars.dot,
    $nest: {
      '&:hover': {
        background: vars.selected
      }
    }
  })
);
export const DotHover = style({
  background: vars.selected
});
export const DotOutput = style({
  marginRight: -vars.dot * 3 / 2,
  marginLeft: -vars.dot
});
export const DotInput = style({
  marginLeft: -vars.dot * 3 / 2,
  marginRight: -vars.dot
});
export const DotConnected = style({
  background: vars.lines
});
