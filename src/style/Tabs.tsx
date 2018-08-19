import { style } from 'typestyle';
import * as vars from './vars';
export const Tabs = style({
  position: 'absolute',
  top: 0,
  left: 50,
  width: '100%',
  display: 'flex',
  flexFlow: 'row nowrap'
});
export const Tab = style({
  padding: '10px 18px',
  background: vars.bglight,
  color: vars.inActiveTab,
  fontSize: 12,
  fontWeight: 400,
  letterSpacing: 1,
  borderRightWidth: 1,
  borderRightStyle: 'solid',
  borderRightColor: vars.bg,
  transition: vars.transition,
  $nest: {
    '&:hover': {
      color: vars.text
    }
  }
});
export const ActiveTab = style({
  color: vars.cursorColor
});
export const RenameTabInput = style({
  border:0,
  color:vars.text,
  fontSize:12,
  lineHeight:1,
  background:'#ffffff00'
})