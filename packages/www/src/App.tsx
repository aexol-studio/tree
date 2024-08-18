import * as tree from '@aexol/tree';
import { useEffect, useRef, useState } from 'react';
import definitions from '@/definitions.json';

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [diagram, setDiagram] = useState<tree.Diagram>();
  useEffect(() => {
    if (!ref.current) {
      throw new Error('No root html element');
    }
    const diagram = new tree.Diagram(ref.current, {});
    diagram.setNodes(definitions);
    setDiagram(diagram);
  }, []);
  console.log({ diagram });

  return <div className="w-full h-full" ref={ref}></div>;
}

export default App;
