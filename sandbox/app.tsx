import * as React from 'react';
import { render } from 'react-dom';

import { Graph } from '../src/Graph';

import { testCategories } from './testCategories';

class App extends React.Component {
  render() {
    return (
      <div>
        <Graph
          categories={testCategories}
          preventOverscrolling
          serialize={(nodes, links, tabs) => console.info('Serialize called:', nodes, links, tabs)}
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
