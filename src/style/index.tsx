import { style, classes } from 'typestyle';
import * as vars from './vars';
export const DependencyBackground = style({
  background: `radial-gradient(${vars.bgradial}, ${vars.bg})`,
  width: `100%`,
  height: `100%`,
  overflow: `hidden`,
  fontFamily: `Open Sans`,
  userSelect: `none`
});
export const DependencyNodes = style({
  width: `100%`,
  height: `100%`,
  display: `flex`
});
export const DependencyExpand = style({
  position: `relative`,
  marginRight: `-100%`,
  display: `flex`,
  float: `left`,
  width: `100%`,
  height: `100%`
});
export const DependencyInputs = style({
  display: `flex`,
  flexFlow: `column nowrap`,
  justifyContent: `center`
});
export const DependencyOutputs = style({
  marginLeft: `auto`
});
export const DependencyInputPort = style({
  padding: `20px 0`
});
export const DependencyInputPortDot = vars.portDot;
export const DependencyInputPortName = style({
  color: `${vars.off}`
});
export const DependencyNode = style({
  color: `#ddd`,
  background: `${vars.bg}`,
  borderRadius: `10px`,
  borderTopRightRadius: `0px`,
  fontSize: `10px`,
  position: `absolute`,
  cursor: `move`
});
export const DependencyNodeSelected = style({
  background: `${vars.selected}`
});
export const DependencyNodeTitle = style({
  padding: `15px`,
  background: `#000000aa`,
  borderTopLeftRadius: `10px`,
  borderTopRightRadius: `0px`,
  fontWeight: 300,
  textAlign: `center`,
  textTransform: `uppercase`,
  pointerEvents: `none`,
  userSelect: `none`
});
export const DependencyNodePorts = style({
  padding: `20px 0`
});
export const DependencyNodePort = style({
  display: `flex`,
  flexDirection: `row`,
  justifyContent: `flex-end`,
  alignItems: `center`,
  padding: `5px 0`
});
export const DependencyNodePortInputAdd = style({
  background: `transparent`,
  color: `${vars.off}`,
  border: `0`,
  padding: `5px`,
  $nest: {
    '&:focus': {
      outline: `none`
    }
  }
});
export const DependencyNodePortName = style({
  padding: `5px`,
  textAlign: `center`,
  pointerEvents: `none`,
  userSelect: `none`,
  fontWeight: `bold`,
  color: `${vars.off}`,
  fontSize: `10px`,
  marginRight: `10px`
});
export const DependencyNodePortNameOutput = style({
  marginLeft: `10px`,
  marginRight: `0`
});
export const DependencyNodePortDot = classes(
  style({
    width: `${vars.dot}`,
    height: `${vars.dot}`
  }),
  vars.portDot
);
export const DependencyNodePortDotOutput = style({
  marginRight: `5px`,
  $nest: {
    '&::after': {
      content: '',
      marginTop: `3px`,
      position: `absolute`,
      width: `5px`,
      height: `2px`,
      background: `${vars.off}`
    }
  }
});
export const DependencyNodePortDotInput = style({
  marginLeft: `5px`,
  $nest: {
    '&::after': {
      content: '',
      marginTop: `3px`,
      position: `absolute`,
      width: `5px`,
      height: `2px`,
      background: `${vars.off}`
    }
  }
});
export const DependencyNodePortDotConnected = style({
  background: `${vars.off}`
});
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

// HELPERS

export const HelperScreen = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 48,
  fontWeight: 'bold',
  pointerEvents:'none',
  top: 0
});
export const HelperPhrase = style({
  width: 640,
  maxWidth:'80%',
  color: vars.text,
  opacity:0.4
});
