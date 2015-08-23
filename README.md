# react-observe-store
a small utility which uses a regex to match store paths/properties accessed in render function, observe them and call render on your component. Observation is based on https://github.com/polymer/observe-js.

This can make you independent from Flux or any other event emitter based solution for state management.

## Usage
Install with JSPM: `jspm i github:capaj/react-observe-store`

then just simply call observeStore in the constructor:
```javascript
import {observeStore} from 'react-observe-store';
import React from 'react';
const store = {a: 1, b:2, c:4};	//or import store from another file

export default class About extends React.Component {
  constructor(...props) {
    super(...props);
    observeStore(this, store, 'store');
  }
  render() {
    return <div>{store.b}</div>;	//observes store.b for changes and automatically rerenders when it's value changes
  }
}
```
or you can utilize a helper method for observing multiple stores
```javascript
import {componentObserveStores} from 'react-observe-store';
import React from 'react';
const storeA = {a: 1, b:2, c:4};	//or import store from another file
const storeB = {a: 0, b:10, c:5};

export default class About extends React.Component {
  constructor(...props) {
    this.observedStores = [()=> storeA, ()=> storeB],
    componentObserveStores(this);
  }
  render() {
    return <div>{storeA.b}{storeB.c}</div>;	//observes store.b for changes and automatically rerenders when it's value changes
  }
}
```

By default, observeStore looks at the render method, but you can pass any function as 4th argument to statically analyse
```javascript
observeStore(this, ()=> store, anyFunctionWhichUsesTheStoreToRenderElements);	//you can pass optionally a function which you want to statically check for store usages
```

## Does it work?

Yes, it is thoroughly tested and it does work, with a caveat that it can't determine a path to watch if you're accessing the member via a variable resolved in render time.

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
When a store variable is not known before runtime, you can always import `observe-js` and use it to manually observe a path known at runtime.
I find that utilizing Object.observe for keeping my view in sync greatly reduces the overall complexity of my react apps. No need for Flux, Reflux or even Redux.

### Browser support
the same as [observe-js](https://github.com/polymer/observe-js), so anything newer than IE9. If Object.observe is not available, it uses dirty checking.

## Know issue

React hot loader api replaces your render methods with a cached function, so we cannot inspect the original render method. Be aware. Fix is easy, but I am not sure when it will be merged.

## Contributing
Do you have a bug or feature request? Feel free ask, post a bug or better yet a PR!

Running tests:
```
npm i
npm run serve
```
Then just go to http://localhost:3000/test/ and let them a second or more to pass.
