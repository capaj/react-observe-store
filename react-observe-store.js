import observe from 'observe-js';
const PathObserver = observe.PathObserver;
const ArrayObserver = observe.ArrayObserver;
const ObjectObserver = observe.ObjectObserver;
const Path = observe.Path;

import stripLastPropertyAcessor from './util/stripLastPropertyAcessor'
/**
 * @param {Object} comp react component
 * @param {Object} store object you use to store state in
 * @param {String} varName variable name that you have for the store in the component render function
 */
export default function observeStore(comp, store, varName){

	const reg = new RegExp(varName + '.*?(?=\\)|]|,|\\()', 'ig');
  const toString = comp.render.toString();
  const storeAccessors = toString.match(reg);
	const observersByPaths = {};

	/**
	 * @param {String} path
	 * @param {Function} observerCreateFn function which returns the observer
	 */
	const observePath = function(path, observerCreateFn) {
		if (!observersByPaths[path]) {
			let obs = observerCreateFn();
			observersByPaths[path] = obs;

			obs.open(() => {
				comp.forceUpdate();
			});

			//console.log('registered an observer for path', path);
		}
	};
	if (storeAccessors) {
    //console.log("storeAccessors", storeAccessors);
		storeAccessors.forEach((path) => {
			path = path.substr(varName.length + 1);
			let pathObj = Path.get(path);
      if (!pathObj.valid) {
        path = path + ']';
        pathObj = Path.get(path);
      }
      if (!pathObj.valid) {
        return;
      }
			const val = pathObj.getValueFrom(store);
			const type = typeof val;
			let createObserver;
			if (Array.isArray(val)) {
				createObserver = function() {
					return new ArrayObserver(val);
				}
			} else if(type === 'object'){
				createObserver = function() {
					return new ObjectObserver(val);
				}
			} else if(type === 'function') {
				path = stripLastPropertyAcessor(path);

				const parentVal = Path.get(path).getValueFrom(store);
				if (Array.isArray(parentVal)) {
					createObserver = function() {
						return new ArrayObserver(parentVal); // so last part of the path was an array methods
					};
				} else {
					throw new Error('store methods should not be invoked from component render methods, path: ', path);
					//stores should not have getter methods, they should be POJO objects, maybe with some setter methods
				}

			} else {
				createObserver = function() {
					return new PathObserver(store, path);
				}
			}
			observePath(path, createObserver);
		});

		var originalUnmount = comp.componentWillUnmount;
		comp.componentWillUnmount = function() {
			Object.keys(observersByPaths).forEach((path)=>{
				observersByPaths[path].close();
			});
			originalUnmount.apply(comp, arguments);
		}
	}
}