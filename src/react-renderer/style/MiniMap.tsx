import { style } from 'typestyle';
import * as vars from '../../vars';

export const MiniMap = style({
  position: 'fixed',
  right: 0,
  top: 0,
  background: vars.bgcategory + '33',
  overflow: 'hidden',
  border: `1px solid ${vars.minimapBorder}`,
  backgroundSize: '10px 10px',
  backgroundImage: `linear-gradient(to right, ${vars.minimapBorder}88 1px, transparent 1px), linear-gradient(to bottom, ${vars.minimapBorder}88 1px, transparent 1px)`
});
export const MiniMapHolder = style({

})
export const MiniMapElement = style({
  width: 6,
  height: 3,
  borderRadius: 1,
  background: vars.minimapElement,
  position: 'absolute'
});
export const MiniMapElementSelected = style({
  background:vars.selected
})
export const MiniMapWhere = style({
  background: vars.selected + '11',
  borderColor: vars.selected + '99',
  borderWidth: 1,
  borderStyle: 'solid',
  position: 'absolute',
  borderRadius: 2
});
