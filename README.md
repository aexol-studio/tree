### TREE - GRAPH VISUALISER ![Vector 902 (Stroke) (1)](https://github.com/user-attachments/assets/93e38773-7467-4374-a9e8-13387aa5b076)
<!--STRONA WIZUALNA: słowo "Tree" w nagłówku można albo wyboldować, albo napisać wielkimi literami aby bardziej go wyróżnić, szczególnie, że występuje tylko raz i w związku z tym nie obciążyłaby taka zmiana wizualnie - alternatywnie można też napisać wielkimi literami całość tekstu; TREŚĆ MERYTORYCZNA: w zależności od tego, czy chcemy przestrzegać British English, czy American English, zmieni to pisownię słowa "visualiser" - w American English powinno być "visualizer"-->
[![npm](https://img.shields.io/npm/v/@aexol/tree.svg?style=flat-square)](https://www.npmjs.com/package/@aexol/tree) [![npm downloads](https://img.shields.io/npm/dm/@aexol/tree.svg?style=flat-square)](https://www.npmjs.com/package/@aexol/tree)

Tree is a tool for displaying node based systems. <!--TREŚĆ MERYTORYCZNA: "a tool" zamiast "the tool" ponieważ pojawia się po raz pierwszy na stronie-->
This package contains one dependency. <!--STRONA WIZUALNA: można ewentualnie dodać element Markdowna do tej linijki tak, aby podkreślić, że następuje zależność. TREŚĆ MERYTORYCZNA: można dodać źródło, z którego czerpie ta paczka z nazwy albo z załącznika w postaci linku tak, aby użytkownik był o tym poinformowany bez konieczności przenoszenia wzroku na kod--> 

<br />

## Getting Started 

This section will help you get started with the graph visualizer.


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
<br />

### Light Mode
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->

Diagram is in dark mode by defult, but you can easily switch to light theme. Just add the options for that while creating the Diagram.

```ts
import { Diagram, DefaultDiagramThemeLight } from '@aexol/tree'
this.diagram = new Diagram(document.getElementById("root"),
{
  theme: DefaultDiagramThemeLight
});
```

<br />

## Develop & Contribute

```sh
$ git clone https://github.com/aexol-studio/tree
$ npm install
$ npm run start
```

<br />

## Add to Your Own Project
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->
<!--TREŚĆ MERYTORYCZNA: dodano "own"-->

```sh
$ npm install @aexol/tree
```

<br />

## Listening to Diagram Events
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->

It's possible to attach <!--attach what?--> to certain events that occur inside the diagram.
You can do it by using familiar `.on()` syntax, e.g.:

```
this.diagram = new Diagram(/* ... */);
/* ... */
this.diagram.on(EVENT_NAME, () => {
  // callback
});
```
<br />

| The list of all subscribable events: ||
|:---|---|
| *ViewModelChanged* | fires when a view model (pan, zoom) was changed |
| *NodeMoving* | fires when node is being moved |
| *NodeMoved* | fires when node stops being moved |
| *NodeSelected* | fires when node(s) was selected |
| *UndoRequested* | fires when undo was requested |
| *RedoRequested* | fires when redo was requested |

> [!NOTE]
> You can unsubscribe your listener by either using `.off()` or by invoking the unsubscriber function that is returned from `.on()`:

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

<br />

## Serialisation of Data
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->
<!--TREŚĆ MERYTORYCZNA: w zależności od tego, czy chcemy przestrzegać British English, czy American English, zmieni to pisownię słowa "serialisation" - w American English powinno być "serialization", American English w przypadku tego słowa jest też bardziej powszechny-->

```js
const diagram = new Diagram(/* ... */);
const callback = ({nodes, links}) => {
  // Here you receive nodes and links after Serialisation
};
this.diagram.on('DataModelChanged', callback); // callback will be fired

```

<br />

## Docs

To generate docs <!--what docs, does it need clarification?--> simply type:
```
npm run docs
```

### Controls

|Here is a list of available controls: ||
|:---|---|
| Press and hold Left Mouse Button and move mouse | pans the view |
| Press and hold Left Mouse Button on node | moves the node |
| CLICK ON NODE TYPE | centers view on parent node (if node is a children of other node) |
| SHIFT + Left Mouse Button Click | selects multiple nodes |

<br />

## ♥️ Contribute

Feel free to contribute! Don't hesitate to:

- Fork this repo
- Create your own feature branch using: git checkout -b feature-name
- Commit your changes with: git commit -am 'Add some feature'
- Push to the branch: git push origin my-new-feature
- Submit a pull request

<!-- ALTERNATIVE ARROW COLOR: ![arrow-top-blue](https://github.com/user-attachments/assets/db67ff9e-fc13-4e43-a48f-0a9182e8093c)-->
