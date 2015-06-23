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
	const renderString = comp.render.toString();
	const reg = new RegExp(varName + '.*?(?=\\))', 'ig');
	const storeAcessors = renderString.match(reg);
	if (storeAcessors) {
		const observers = storeAcessors.map((path) => {
			path = path.substr(varName.length + 1);
			var pathObj = Path.get(path);
			var val = pathObj.getValueFrom(store);
			var observer;
			if (Array.isArray(val)) {
				observer = new ArrayObserver(val);
			} else if(typeof val === 'object'){
				observer = new 	ObjectObserver(val);
			} else {
				observer = new PathObserver(store, path);
			}
			observer.open(() => {
				comp.forceUpdate();
			});
			return observer;
		});

		var originalUnmount = comp.componentWillUnmount;
		comp.componentWillUnmount = function() {
			observers.forEach((observer)=>{
				observer.close();
			});
			originalUnmount.apply(comp, arguments);
		}
	}
}