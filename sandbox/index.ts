import { Diagram } from '../src/index';

class App {
  diagram?: Diagram = undefined;
  constructor() {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('No root html element');
    }
    this.diagram = new Diagram(root, {});
    this.diagram.setNodes(require('./definitions.json'));
    setTimeout(() => {
      this.diagram.eventBus.publish('RequestNodeSelect', {
        fn: (n) => n.name === 'Pizza',
      });
    }, 1000);
  }
}
new App();
