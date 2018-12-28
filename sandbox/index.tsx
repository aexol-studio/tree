import * as React from 'react';
import { render } from 'react-dom';

import { DiagramReact } from '../src/index';

class App extends React.Component {
  render() {
    return (
      <DiagramReact categories={[]} />
    );
  }
}

render(<App />, document.getElementById('root'));
