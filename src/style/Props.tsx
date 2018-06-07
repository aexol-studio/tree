import { style } from 'typestyle';
import * as vars from './vars';

export const Props = style({
  background: `${vars.bg}`,
  color: `${vars.text}`,
  position: `absolute`,
  right: `0`,
  top: `0`,
  margin: `20px`,
  padding: `20px`,
  fontSize: `12px`
});
export const PropsLabel = style({
  fontWeight: 100,
  marginBottom: 15
});
export const PropsPort = style({
  padding: `5px 0`
});
export const PropsPortInput = style({
  border: `0`,
  background: `${vars.bg}`,
  color: `${vars.selected}`,
  width: `100%`,
  padding: `5px`,
  fontWeight: `lighter`
});
