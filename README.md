# Tree - graph visualiser
[![npm](https://img.shields.io/npm/v/@aexol/tree.svg?style=flat-square)](https://www.npmjs.com/package/@aexol/tree) [![npm downloads](https://img.shields.io/npm/dm/graphsource.svg?style=flat-square)](https://www.npmjs.com/package/@aexol/tree)

Tree is the tool for displaying node based systems. 
 
This package contains one dependency.

## Getting started

### Javascript
```js
import { Diagram } from '@aexol/tree'
class App {
  constructor() {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("No root html element");
    }
    this.diagram = new Diagram(root, {});
    this.diagram.setNodes([
        {
            "name": "Query",
            "type": "type",
            "id": "1",
            "description": "",
            "inputs": [
                "2"
            ],
            "outputs": [],
            "options": [
                "query"
            ]
        },
        {
            "name": "pizzas",
            "type": "Pizza",
            "id": "2",
            "inputs": [],
            "outputs": [
                "2"
            ],
            "description":"get all pizzas a a a from the database",
            "options": [
                "array",
                "required"
            ]
        },
        {
            "name": "Pizza",
            "type": "type",
            "id": "3",
            "description": "Main type of the schema",
            "inputs": [
                "4",
            ],
            "outputs": [],
            "options": []
        },
        {
            "name": "name",
            "type": "String",
            "id": "4",
            "inputs": [],
            "outputs": [
                "3"
            ],
            "options": [
                "required"
            ]
        }
    ])
  }
}
new App()
```

### TypeScript

```ts
import { Diagram, NodeDefinition, AcceptedNodeDefinition } from 'graphsource'
this.diagram = new Diagram(document.getElementById("root"));
this.diagram.setNodes
]);
```

### Light mode

Diagram is in dark mode by defult, but You can easily change the theme to light one. Just add the options while creating Diagram.

```ts
import { Diagram, DefaultDiagramThemeLight } from 'graphsource'
this.diagram = new Diagram(document.getElementById("root"),
{
  theme: DefaultDiagramThemeLight
});
```


## Develop & Contribute

```sh
$ git clone https://github.com/graphql-editor/diagram
$ npm install
$ npm run start
```

## Add to your project

```sh
$ npm install graphsource
```
## Listening to diagram events

It's possible to attach to certain events that occur inside the diagram.
You can do it by using familiar `.on()` syntax, e.g.:

```
this.diagram = new Diagram(/* ... */);
/* ... */
this.diagram.on(EVENT_NAME, () => {
  // callback
});
```

Here is the list of all subscribable events:
* *ViewModelChanged* - fires when a view model (pan, zoom) was changed
* *NodeMoving* - fires when node is being moved
* *NodeMoved* - fires when node stops being moved
* *NodeSelected* - fires when node(s) was selected
* *UndoRequested* - fires when undo was requested
* *RedoRequested* - fires when redo was requested

You can unsubscribe your listener either by using `.off()`, or by invoking unsubscriber function that is being returned from `.on()`:

```js
this.diagram = new Diagram(/* ... */);
const callback = (nodeList) => {
  console.log('Nodes are moving!', nodeList);
};
this.diagram.on('NodeMoving', callback); // callback will be fired
// ...
this.diagram.off('NodeMoving', callback); // callback will not be fired anymore
```

```js
this.diagram = new Diagram(/* ... */);
const callback = () => {
  console.log('node moving!');
};
const unsubscriber = this.diagram.on('NodeMoving', callback); // callback will be fired
// ...
unsubscriber(); // callback will not be fired anymore
```

## Serialisation of data

```js
const diagram = new Diagram(/* ... */);
const callback = ({nodes, links}) => {
  // Here you receive nodes and links after Serialisation
};
this.diagram.on('DataModelChanged', callback); // callback will be fired

```

## Docs

To generate docs simply type:
```
npm run docs
```


### Controls

* Pan - press and hold Left Mouse Button and move mouse
* Move - press and hold Left Mouse Button on node
* CLICK ON NODE TYPE - if node is a children of other node it centers view on parent node
* SHIFT + Left Mouse Button Click - select multiple nodes

## Contribute

Feel free to contact us and contribute in graphql editor project. artur@graphqleditor.com

1.  fork this repo
2.  Create your feature branch: git checkout -b feature-name
3.  Commit your changes: git commit -am 'Add some feature'
4.  Push to the branch: git push origin my-new-feature
5.  Submit a pull request

## Used by

Here is [Live Demo](https://app.graphqleditor.com) of diagram used to create node based graphql system
