import React from 'react';
import { Home } from './Home';
import { ThemeDiagram } from './ThemeDiagram';
import { LargeSchema } from './LargeSchema';
import { render } from 'react-dom';
import qs from 'query-string';

export enum queries {
  darkTheme = 'darkTheme',
  lightTheme = 'lightTheme',
  largeNumberOfNodes = 'largeNumberOfNodes'
}

const parseQuery = () => {
  const { option } = qs.parse(location.search)
  
  return option
}

{
  switch (parseQuery()) {
    case queries.darkTheme:
      new ThemeDiagram('dark')
      break;
    case queries.lightTheme:
      new ThemeDiagram('light')
      break;
    case queries.largeNumberOfNodes:
      new LargeSchema()
      break;
    default:
      render(<Home />, document.getElementById('root'))
  }
}
