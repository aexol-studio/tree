# TREE - graph visualiser
<!--STRONA WIZUALNA: słowo "Tree" w nagłówku można albo wyboldować, albo napisać wielkimi literami aby bardziej go wyróżnić, szczególnie, że występuje tylko raz i w związku z tym nie obciążyłaby taka zmiana wizualnie - alternatywnie można też napisać wielkimi literami całość tekstu; TREŚĆ MERYTORYCZNA: w zależności od tego, czy chcemy przestrzegać British English, czy American English, zmieni to pisownię słowa "visualiser" - w American English powinno być "visualizer"-->
[![npm](https://img.shields.io/npm/v/@aexol/tree.svg?style=flat-square)](https://www.npmjs.com/package/@aexol/tree) [![npm downloads](https://img.shields.io/npm/dm/@aexol/tree.svg?style=flat-square)](https://www.npmjs.com/package/@aexol/tree) <!--STRONA WIZUALNA: obrazy przedstawiają, że npm jest invalid, oraz że "package not found or too new" - czy jest to coś do zaktualizowania bądź wyrzucenia później, kiedy npm już będzie dostępny?-->

Tree is a tool for displaying node based systems. <!--TREŚĆ MERYTORYCZNA: "a tool" zamiast "the tool" ponieważ pojawia się po raz pierwszy na stronie-->
This package contains one dependency. <!--STRONA WIZUALNA: można ewentualnie dodać element Markdowna do tej linijki tak, aby podkreślić, że następuje zależność. TREŚĆ MERYTORYCZNA: można dodać źródło, z którego czerpie ta paczka z nazwy albo z załącznika w postaci linku tak, aby użytkownik był o tym poinformowany bez konieczności przenoszenia wzroku na kod--> 

<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia podpisu pod tytułem/wstępu od dalszej treści i podrozdziałów-->

## Getting Started 
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->


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
<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od kodu powyżej, który sprawia, że następujący nagłówek nieco mniej przyciąga wzrok-->

### Light Mode
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->

Diagram is in dark mode by defult, but You can easily change the theme to light one. Just add the options while creating Diagram.

```ts
import { Diagram, DefaultDiagramThemeLight } from '@aexol/tree'
this.diagram = new Diagram(document.getElementById("root"),
{
  theme: DefaultDiagramThemeLight
});
```

<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od następnego podrozdziału-->

## Develop & Contribute

```sh
$ git clone https://github.com/aexol-studio/tree
$ npm install
$ npm run start
```

<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od następnego podrozdziału-->

## Add to Your Own Project
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->
<!--TREŚĆ MERYTORYCZNA: dodano "own"-->

```sh
$ npm install @aexol/tree
```

<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od następnego podrozdziału-->

## Listening to Diagram Events
<!--STRONA WIZUALNA: zmiana na formatowanie Pierwsza Litera Wyrazu Pisana Wielką Literą-->

It's possible to attach to certain events that occur inside the diagram.
You can do it by using familiar `.on()` syntax, e.g.:

```
this.diagram = new Diagram(/* ... */);
/* ... */
this.diagram.on(EVENT_NAME, () => {
  // callback
});
```
<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od kodu powyżej, który sprawia, że następująca lista punktowana nieco mniej przyciąga wzrok-->

Here is the list of all subscribable events:
* *ViewModelChanged* - fires when a view model (pan, zoom) was changed
* *NodeMoving* - fires when node is being moved
* *NodeMoved* - fires when node stops being moved
* *NodeSelected* - fires when node(s) was selected
* *UndoRequested* - fires when undo was requested
* *RedoRequested* - fires when redo was requested

> [!NOTE]
> You can unsubscribe your listener either by using `.off()`, or by invoking unsubscriber function that is being returned from `.on()`:
<!--STRONA WIZUALNA: dodanie alertu "NOTE" jako dopisek do kodu, tooltip-->

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

<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od następnego podrozdziału-->

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

<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od następnego podrozdziału-->

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
  
<br /><!--STRONA WIZUALNA: przerwa na potrzeby wizualnego oddzielenia od następnego podrozdziału-->

## Contribute

Feel free to contribute.

1.  fork this repo
2.  Create your feature branch: git checkout -b feature-name
3.  Commit your changes: git commit -am 'Add some feature'
4.  Push to the branch: git push origin my-new-feature
5.  Submit a pull request
