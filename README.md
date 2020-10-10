# react-dnd-action

**An awesome drag and drop library for React, using a custom-hook: Rich animations, nested containers, touch support, accessible out of the box and more**.<br />
This is a port (actually a very thin adapter on top of) [svelte-dnd-action](https://github.com/isaacHagoel/svelte-dnd-action) - the leading drag and drop library for Svelte.

## Current Status
This is still a prototype

## Install

```bash
npm install --save react-dnd-action
```

## Usage

```jsx
import React, {useRef, useCallback, useState} from 'react';
import {useDndZone} from "react-dnd-action";

function App() {
  const listRef = useRef();
  const [items, setItems] = useState([
    {id: "item1"},
    {id: "item2"},
    {id: "item3"}
  ]);
  const handleSort = useCallback(function ({items, info}) {
    console.log("sort handler got", {items, info});
    setItems(items);
  }, []);
  useDndZone(listRef, {items, flipDurationMs: 150}, handleSort, handleSort);

  return (
      <div className="App">
        <ul ref={listRef}>
          {items.map(item => <li key={item.id}>{item.id}</li>)}
        </ul>
      </div>
  );
}

export default App;

```

## License

MIT © [isaacHagoel](https://github.com/isaacHagoel)
