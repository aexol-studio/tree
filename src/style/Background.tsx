import { style, classes } from 'typestyle';
import * as vars from './vars';
export const Background = classes(
  vars.SelectNone,
  style({
    background: vars.bgradial,
    width: `100%`,
    height: `100%`,
    overflow: `hidden`,
    fontFamily: `Open Sans`,
  })
);
