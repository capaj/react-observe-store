'use babel'
import observe from 'observe-js'
const {PathObserver, ArrayObserver, ObjectObserver, Path} = observe

import stripLastPropertyAcessor from './util/stripLastPropertyAcessor'

function regExpEscape (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

/**
 * @param {Object} comp react component
 * @param {Object} store object you use to store shared state in
 * @param {String} varName identifier of a store that you use in your render method
 * @param {Function} [renderMethod=comp.render] when specified, will try to match store accessors in it rather than in comp.render
 */
export function observeStoreByString (comp, store, varName, renderMethod) {
  const reg = new RegExp('\\b' + varName + '\\..*?(?=\\)|\n|]|,|\\()', 'ig')
  if (!renderMethod) {
    renderMethod = comp.render
  }
  const stringifiedRenderMethod = renderMethod.toString()
  const storeAccessors = stringifiedRenderMethod.match(reg)
  const observersByPaths = {}

  /**
   * @param {String} path
   * @param {Function} observerCreateFn function which returns the observer
   */
  const observePath = function (path, observerCreateFn) {
    if (!observersByPaths[path]) {
      let obs = observerCreateFn()
      observersByPaths[path] = obs

      obs.open(() => {
        comp.forceUpdate()
      })
      // console.log('registered an observer for path', path)
    }
  }
  if (storeAccessors) {
    // console.log("storeAccessors", storeAccessors)
    storeAccessors.forEach((path) => {
      path = path.substr(varName.length + 1)
      let pathObj = Path.get(path)
      if (!pathObj.valid) {
        path = path + ']'
        pathObj = Path.get(path)
      }
      if (!pathObj.valid) {
        return
      }
      const val = pathObj.getValueFrom(store)
      const type = typeof val
      let createObserver
      if (Array.isArray(val)) {
        createObserver = () => {
          return new ArrayObserver(val)
        }
      } else if (type === 'object') {
        createObserver = () => {
          return new ObjectObserver(val)
        }
      } else if (type === 'function') {
        path = stripLastPropertyAcessor(path)

        const parentVal = Path.get(path).getValueFrom(store)
        if (Array.isArray(parentVal)) {
          createObserver = () => {
            return new ArrayObserver(parentVal) // so last part of the path was an array methods
          }
        } else {
          throw new Error('store methods should not be invoked from component render methods, path: ', path)
          // stores should not have getter methods, they should be POJO objects, maybe with some setter methods
        }

      } else {
        createObserver = () => {
          return new PathObserver(store, path)
        }
      }
      observePath(path, createObserver)
    })

    const originalUnmount = comp.componentWillUnmount
    comp.componentWillUnmount = () => {
      Object.keys(observersByPaths).forEach((path)=>{
        observersByPaths[path].close()
      })
      if (originalUnmount) {
        originalUnmount.apply(comp, arguments)
      }
    }
  }
}

/**
 * @param {Object} comp react component
 * @param {Function} store object you use to store state in
 * @param {Function} [renderMethod=comp.render] when specified, will try to match store accessors in it rather than in comp.render
 */
export function observeStore(comp, storeGetter, renderMethod){
  const store = storeGetter()
  const entire = storeGetter.toString()
  let varName = entire
    .substring(entire.indexOf('return ') + 7, entire.lastIndexOf("}"))
    .replace(';', '').trim()
  varName = regExpEscape(varName)

  observeStoreByString(comp, store, varName, renderMethod)
}

/**
 * @param {Object} comp react component with observedStores property
 */
export function componentObserveStores(comp) {
  comp.observedStores.forEach(function (storeGetter){
    observeStore(comp, storeGetter)
  })
}
