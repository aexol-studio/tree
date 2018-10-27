import * as React from 'react'
import { GraphProps } from './types';
import { Renderer } from './react-renderer/Renderer';

export class Graph extends React.Component<GraphProps>{
  render(){
    return <Renderer {...this.props} /> 
  }
}