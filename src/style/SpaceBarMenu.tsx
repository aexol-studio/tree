import { style, classes } from 'typestyle';
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
  padding: 10,
  background: vars.bgspace
});
export const Category = style({
  margin: '0 5px',
  display: 'inline-table'
});
export const Items = style({
  position: 'absolute',
  maxWidth: '300px',
  display: 'grid',
  gridTemplateColumns: 'repeat(3,auto)',
  background: vars.bgspace,
  padding: '20px',
  margin: '10px 0',
});
export const CategoryName = style({
  background: vars.bgcategory,
  color: vars.text,
  padding: '10px 15px',
  fontSize: '10px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.borderRadius,
  transition: vars.transition,
  $nest: {
    '&:hover': {
      background: vars.selected
    }
  }
});

export const CategoryNameActive = style({
  background: vars.selected
});
export const Item = classes(
  CategoryName,
  style({
    margin: '0 5px 5px 0'
  })
);
