# react-observe-store
a function, which tries to match store paths/properties accessed in render function, observe them and call render on your component. Based on https://github.com/polymer/observe-js

## Usage
Install with JSPM: `jspm i github:capaj/react-observe-store`

```javascript
import observeStore from 'react-observe-store';
import React from 'react';
const store = {a: 1, b:2, c:4};	//or import store from another file

export default class About extends React.Component {
  constructor(...props) {
    observeStore(About, store, 'store');
  }
  render() {
    return <div>{store.b}</div>;	//observes store.b for changes and automatically rerenders when it's value changes
  }
}

```
## Does it work?
Yes, it is thouroughly tested and it does work, with a caveat that it can't determine a path to watch if you're accessing the member via a variable resolved in render time.
For example:
```javascript
const store = {a: 1, b:2, c:4};
...
constructor(){
	this.myProp = 'b';
}
render(){
	return <div>{store[this.myProp]}</div>	//won't be observed automagically :-(
	return <div>{store.b}</div>		//works, automagically observes
	return <div>{store['b']}</div>	//works, automagically observes
}
```
Even when a store variable is not observed automatically, you can always import `observe-js` and use it to manually subscribe.
I find that utilizing Object.observe for forcingUpdates on components greatly reduces the overall complexity of my react apps.

## Contributing
Do you have a bug or feature request? Feel free ask, post a bug or better yet a PR!
