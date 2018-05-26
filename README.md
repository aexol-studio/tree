# How to use it

## Define spacebar menu actions

```jsx
let allCategories = [{
  name: 'middlewares',
  items: [
    {
      name: 'middleware',
      type: 'middleware',
      inputs: [
        {
          name: ''
        }
      ],
      outputs: [
        {
          name: ''
        }
      ]
    }
  ]
}]
```


```jsx
<Graph
  categories={allCategories}
/>
```

Now if you press spacebar when mouse is on the graph you get this menu, which creates nodes.

## Serialization of data
```jsx
<Graph
  categories={allCategories}
  serialize={(nodes, links) => {
  }}
/>
```
