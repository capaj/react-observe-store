import observe from 'observe-js';
const PathObserver = observe.PathObserver;
const ArrayObserver = observe.ArrayObserver;
const ObjectObserver = observe.ObjectObserver;
const Path = observe.Path;

/**
 * @param {Object} comp react component
 * @param {Object} store object you use to store state in
 * @param {String} varName variable name that you have for the store in the component render function
 */
export default function observeStore(comp, store, varName){

	const reg = new RegExp(varName + '.*?(?=\\)|\\()', 'ig');
	const storeAcessors = comp.render.toString().match(reg);
	const observersByPaths = {};

	/**
	 * @param {String} path
	 * @param {Object} obs observer
	 */
	const observePath = function(path, obs) {
		if (!observersByPaths[path]) {
			observersByPaths[path] = obs;

			obs.open(() => {
				comp.forceUpdate();
			});

			//console.log('registered an observer for path', path);
		} else {
			obs.close();
		}
	};
	if (storeAcessors) {
		storeAcessors.forEach((path) => {
			path = path.substr(varName.length + 1);
			const pathObj = Path.get(path);
			const val = pathObj.getValueFrom(store);
			const type = typeof val;
			let observer;
			if (Array.isArray(val)) {
				observer = new ArrayObserver(val);
			} else if(type === 'object'){
				observer = new 	ObjectObserver(val);
			} else if(type === 'function') {
				path = path.substring(0, path.lastIndexOf('.'));

				const parentVal = Path.get(path).getValueFrom(store);
				if (Array.isArray(parentVal)) {
					observer = new ArrayObserver(parentVal);	// so last part of the path was an array methods
				} else {
					throw new Error('stores methods should not be invoked from component render methods');
					//stores should not have getter methods, they should be POJO objects, maybe with some setter methods
				}

			} else {
				observer = new PathObserver(store, path);
			}
			observePath(path, observer);
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