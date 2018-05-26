import { style } from 'typestyle';
import * as vars from './vars';
export const DependencySimpleNode = style({
  color: '#ddd',
  background: vars.bg,
  borderRadius: '10px',
  fontSize: '10px',
  position: 'absolute',
  cursor: 'move',
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center'
});
export const DependencySimpleNodeSelected = style({
  background: vars.selected
});
export const DependencySimpleNodeTitle = style({
  pointerEvents: 'none',
  userSelect: 'none',
  textAlign: 'center',
  padding: '10px 10px'
});
export const DependencySimpleNodeName = style({
  fontWeight: 500,
  textTransform: 'unset',
  fontSize: '12px'
});
export const DependencySimpleNodeType = style({
  fontWeight: 300,
  textTransform: 'uppercase'
});
