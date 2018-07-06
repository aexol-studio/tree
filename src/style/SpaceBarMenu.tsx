import { style } from 'typestyle';
import * as vars from './vars';
export const Menu = style({
  width: 0,
  height: 0
});
export const Categories = style({
  position: 'absolute',
  textAlign: 'right',
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems:'flex-start',
  padding: 5
});
export const Category = style({
  margin: '0 5px',
  display: 'flex',
  flexFlow: 'column nowrap',
  width: vars.spaceItemWidth
});
export const CategoryName = style({
  background: vars.bgcategory,
  color: vars.text,
  padding: '10px 30px',
  fontSize: '12px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius,
  transition: vars.transition,
  $nest: {
    '&:hover': {
      background: vars.selected,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    }
  }
});

export const TriangleCategoryDown = style({
  width: 0,
  height: 0,
  content: 's',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: 1,
  borderLeft: '5px solid transparent',
  borderRight: '5px solid transparent',
  borderTop: `10px solid ${vars.selected}`,
  borderTopColor: vars.selected,
  transition: vars.transition
});
export const TriangleHidden = style({
  borderTopColor: vars.bgcategory
});
export const CategoryNameActive = style({
  background: vars.selected
});
export const Item = style({
  background: vars.bgcategory,
  color: vars.text,
  fontSize: '11px',
  padding: 5,
  textAlign: 'center',
  display: 'flex',
  borderBottomColor: vars.bgcategoryBorder,
  borderBottomStyle: 'solid',
  borderBottomWidth: 1,
  width:vars.spaceItemWidth,
  alignItems: 'center',
  justifyContent: 'center',
  transition: vars.transition,
  wordBreak:'break-all',
  $nest: {
    '&:last-of-type': {
      borderBottomLeftRadius: vars.borderRadius,
      borderBottomRightRadius: vars.borderRadius
    },
    '&:hover': {
      background: vars.selected
    }
  }
});
export const ItemName = style({});
export const ExpandedItems = style({
  position: 'relative',
});
