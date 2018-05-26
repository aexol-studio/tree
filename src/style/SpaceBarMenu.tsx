import { style, classes } from 'typestyle';
import * as vars from './vars';
export const SpaceBarMenu = style({
  background: vars.bg,
  border: '1px solid #555',
  color: '#aaa',
  width: '40px',
  height: '40px',
  marginTop: '-20px',
  marginLeft: '-20px',
  borderRadius: '20px'
});
export const SpaceBarCategories = style({
  position: 'absolute',
  textAlign: 'right',
  display: 'flex',
  flexFlow: 'row nowrap',
  marginTop: '40px'
});
export const SpaceBarCategory = style({
  margin: '0 5px',
  display: 'inline-table'
});
export const SpaceBarItems = style({
  position: 'absolute',
  maxWidth: '300px',
  display: 'grid',
  gridTemplateColumns: 'repeat(3,auto)',
  background: '#444',
  padding: '20px',
  margin: '10px 0',
  borderRadius: '10px'
});
export const SpaceBarCategoryName = style({
  background: vars.bg,
  padding: '5px 10px',
  fontSize: '10px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: vars.transition
});

export const SpaceBarItem = classes(
  SpaceBarCategoryName,
  style({
    margin: '0 5px 5px 0',
    $nest: {
      '&:hover': {
        color: 'white'
      }
    }
  })
);
