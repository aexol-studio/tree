import { style } from 'typestyle';
import * as vars from './vars';

export const StaticTab = style({
  transition: 'color 0.25s linear',
  padding: '10px 10px',
  color: '#aaaaaa00',
  fontSize: 12,
  fontWeight: 400,
  height: 36,
  letterSpacing: 1,
  borderRightWidth: 1,
});

export const Tabs = style({
  position: 'absolute',
  top: 0,
  left: 75,
  width: '100%',
  height: 36,
  display: 'flex',
  flexFlow: 'row nowrap',
  $nest: {
    [`&:hover .${StaticTab}`]: {
      color: '#aaa',
    }
  }
});

export const Tab = style({
  padding: '0 18px',
  background: vars.tabBackground,
  color: vars.inActiveTab,
  fontSize: 12,
  lineHeight: '36px',
  fontWeight: 400,
  letterSpacing: 1,
  borderRightWidth: 1,
  borderRightStyle: 'solid',
  borderRightColor: vars.bg,
  transition: vars.transition,
  $nest: {
    '&:nth-child(2)': {
      borderBottomLeftRadius: 8,
    },
    '&:last-child': {
      borderBottomRightRadius: 8,
    },
    '&:hover': {
      color: vars.text
    }
  }
});
export const ActiveTab = style({
  background: vars.tabBackgroundActive,
  color: vars.cursorColor
});
export const RenameTabInput = style({
  border:0,
  color:vars.text,
  padding: 0,
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 400,
  letterSpacing: 1,
  width: 'auto',
  background: '#ffffff00',
  fontFamily: vars.mainFontFamily,
  $nest: {
    '&:focus': {
      outline: 0,
    }
  }
})