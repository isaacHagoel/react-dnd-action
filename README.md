# react-dnd-action
This is a feature-complete implementation of drag and drop for React using a custom hook. It supports almost every imaginable drag and drop use-case and is fully accessible. 
See full features list below.
This is a port (actually a very thin adapter on top of) [svelte-dnd-action](https://github.com/isaacHagoel/svelte-dnd-action) - the leading drag and drop library for Svelte.
The goal is to offer a concise, elegant and flexible way to add drag and drop to your React App, without paying for it in bundle size.

![dnd_demo2](https://user-images.githubusercontent.com/20507787/81682367-267eb780-9498-11ea-8dbc-5c9582033522.gif)

### Features
- Awesome drag and drop with minimal fuss 
- Supports horizontal, vertical or any other type of container (it doesn't care much about the shape)
- Supports nested dnd-zones (draggable containers with other draggable elements inside, think Trello)
- Rich animations (can be opted out of)
- Touch support
- Define what can be dropped where (dnd-zones optionally have a "type")
- Scroll dnd-zones and/or the window horizontally or vertically by placing the dragged element next to the edge
- Supports advanced use-cases such as various flavours of copy-on-drag and custom drag handles (see examples below)
- Performant and small footprint (no external dependencies except for the sister library - svelte-dnd-action)  
- Fully accessible (beta) - keyboard support, aria attributes and assistive instructions for screen readers   

## Current Status
This React version is still a prototype, but seems to be working really well. **Many examples will be added here soon.**

## Install
```bash
yarn add react-dnd-action
```
or
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

  useDndZone(listRef, {items}, handleSort);

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

##### Input:
The `useDndZone` custom hook takes four parameters:
```javascript
useDndZone(containerReference, options , onConsider, onFinalize = onConsider)
```
- `containerReference`: a ref to the container which should become a dnd zone (its children become draggable and it's possible to drag items from other dnd zones to it).
- `options`: an options-object with the following attributes. It is passed to svelte-dnd-action:
| Name                      | Type           | Required?                                                    | Default Value                                     | Description                                                  |
| ------------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| `items`                   | Array<Object>  | Yes. Each object in the array **has to have** an `id` property (key name can be overridden globally) with a unique value (within all dnd-zones of the same type) | N/A                                               | The data array that is used to produce the list with the draggable items (the same thing you run your #each block on) |
| `flipDurationMs`          | Number         | No                                                           | `200`                                             | The duration of the flip animation on the items (to make them animated as they "make space" for the dragged item). Set to zero if you don't want animations |
| `type`                    | String         | No                                                           | Internal                                          | dnd-zones that share the same type can have elements from one dragged into another. By default, all dnd-zones have the same type |
| `dragDisabled`            | Boolean        | No                                                           | `false`                                           | Setting it to true will make it impossible to drag elements out of the dnd-zone. You can change it at any time, and the zone will adjust on the fly |
| `dropFromOthersDisabled`  | Boolean        | No                                                           | `false`                                           | Setting it to true will make it impossible to drop elements from other dnd-zones of the same type. Can be useful if you want to limit the max number of items for example. You can change it at any time, and the zone will adjust on the fly |
| `dropTargetStyle`         | Object<String> | No                                                           | `{outline: 'rgba(255, 255, 102, 0.7) solid 2px'}` | An object of styles to apply to the dnd-zone when items can be dragged in to it. Note: the styles override any inline styles applied to the dnd-zone. When the styles are removed, any original inline styles will be lost |
| `transformDraggedElement` | Function       | No                                                           | `() => {}`                                        | A function that is invoked when the draggable element enters the dnd-zone or hover overs a new index in the current dnd-zone. <br />Signature:<br />function(element, data, index) {}<br />**element**: The dragged element. <br />**data**: The data of the item from the items array.<br />**index**: The index the dragged element will become in the new dnd-zone.<br /><br />This allows you to override properties on the dragged element, such as innerHTML to change how it displays. |
| `autoAriaDisabled`        | Boolean        | No                                                           | `false`                                           | Setting it to true will disable all the automatically added aria attributes and aria alerts (for example when the user starts/ stops dragging using the keyboard).<br /> **Use it only if you intend to implement your own custom instructions, roles and alerts.** In such a case, you might find the exported function `alertToScreenReader(string)` useful. |
- `onConsider`: a function that gets called every time the items in the dnd container needs to be updated due to a dnd event that is not permanent. For example when an element is dragged over the zone but wasn't dropped yet. 
- `onFinalize`: a function that gets called when the dragged element is dropped. It is called both on the origin and destination dnd zones (with a different `trigger` param). Defaults to `onConsider` if not provided.
Both `onConsider` and `onFinalize` get passed an object with the following attributes:
* `items`: contains the updated items list.
* `info`: This one can be used to achieve very advanced custom behaviours (ex: copy on drag). In most cases, don't worry about it. It is an object with the following properties: 
   * `trigger`: will be one of the exported list of TRIGGERS (Please import if you plan to use): [DRAG_STARTED, DRAGGED_ENTERED, DRAGGED_OVER_INDEX, DRAGGED_LEFT, DROPPED_INTO_ZONE, DROPPED_INTO_ANOTHER, DROPPED_OUTSIDE_OF_ANY, DRAG_STOPPED]. Most triggers apply to both pointer and keyboard, but some are only relevant for pointer (dragged_entered, dragged_over_index and dragged_left), and some only for keyboard (drag_stopped) 
   * `id`: the item id of the dragged element  
   * `source`: will be one of the exported list of SOURCES (Please import if you plan to use): [POINTER, KEYBOARD]
**You have to update you list of items in the handler you provide in order for this library to work correctly.** 

### Accessibility (beta)
If you want screen-readers to tell the user which item is being dragged and which container it interacts with, **please add `aria-label` on the container and on every draggable item**. The library will take care of the rest.
If you don't provide the aria-labels everything will still work, but the messages to the user will be less informative.
*Note*: in general you probably want to use semantic-html (ex: `ol` and `li` elements rather than `section` and `div`) but the library is screen readers friendly regardless (or at least that's the goal :)).
If you want to implement your own custom screen-reader alerts, roles and instructions, you can use the `autoAriaDisabled` options and wire everything up yourself using markup and the `onConsider` and `onFinalize` callbacks 

##### Keyboard support
- Tab into a dnd container to get a description and instructions
- Tab into an item and press the *Space*/*Enter* key to enter dragging-mode. The reader will tell the user a drag has started. 
- Use the *arrow keys* while in dragging-mode to change the item's position in the list (down and right are the same, up and left are the same). The reader will tell the user about position changes.
- Tab to another dnd container while in dragging-mode in order to move the item to it (the item will be moved to it when it gets focus). The reader will tell the user that item was added to the new list.
- Press *Space*/*Enter* key while focused on an item, or the *Escape* key anywhere to exit dragging mode. The reader will tell the user that they are no longer dragging.  
- Clicking on another item while in drag mode will make it the new drag target. Clicking outside of any draggable will exit dragging-mode (and tell the user)
- Mouse drag and drop can be preformed independently of keyboard dragging (as in an item can be dragged with the mouse while in or out of keyboard initiated dragging-mode)
- Keyboard drag uses the same `onConsider` (only on drag start) and `onFinalize` (every time the item is moved) events but share only some of the `TRIGGERS`. The same handlers should work fine for both.  

### Rules/ assumptions to keep in mind
* Only one element can be dragged in any given time
* The data that represents items within dnd-zones **of the same type** is expected to have the same shape (as in a data object that represents an item in one container can be added to another without conversion).
* Item ids (#each keys) are unique in all dnd containers of the same type. EVERY DRAGGABLE ITEM (passed in through `items`) MUST HAVE AN ID PROPERTY CALLED `id`. You can override it globally if you'd like to use a different key (see below)
* The items in the list that is passed-in are in the same order as the children of the container (i.e the items are rendered in an #each block).
* The host component should refresh the items that are passed in to the custom-action in the onConsider and onFinalize handlers.
* FYI, the library assumes it is okay to add a temporary item to the items list in any of the dnd-zones while an element is dragged around.
* If you want dragged items to be able to scroll the container, make sure the scroll-container (the element with overflow:scroll) is the dnd-zone (the element decorated with this custom action)

### Overriding the item id key name
Sometimes it is useful to use a different key for your items instead of `id`, for example when working with PouchDB which expects `_id`. It can save some annoying conversions back and forth.
In such cases you can import and call `overrideItemIdKeyNameBeforeInitialisingDndZones`. This function accepts one parameter of type `string` which is the new id key name.
For example:
```javascript
import {overrideItemIdKeyNameBeforeInitialisingDndZones} from 'react-dnd-action';
overrideItemIdKeyNameBeforeInitialisingDndZones('_id');
``` 
It applies globally (as in, all of your items everywhere are expected to have a unique identifier with this name). It can only be called when there are no rendered dndzones (I recommend calling it within the top-level <script> tag, ex: in the App component).


### Contributing [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/isaacHagoel/react-dnd-action/issues)
There is still quite a lot to do. If you'd like to contribute please get in touch (raise an issue or comment on an existing one).
Ideally, be specific about which area you'd like to help with.
Thank you for reading :)

## License

MIT © [isaacHagoel](https://github.com/isaacHagoel)
