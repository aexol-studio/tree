import { style } from 'typestyle';
import * as vars from './vars';
export const MiniMap = style({
  position: 'fixed',
  right: 0,
  top: 0,
  background: vars.bgcategory+'66',
  overflow:'hidden',
  borderBottomLeftRadius:vars.borderRadius
});
export const MiniMapElement = style({
  width: 6,
  height: 3,
  borderRadius:1,
  background: vars.lines+'66',
  position: 'absolute'
});
export const MiniMapWhere = style({
  background: vars.selected+'11',
  borderColor: vars.selected+'99',
  borderWidth:1,
  borderStyle:'solid',
  position: 'absolute',
  borderRadius:2,
});
