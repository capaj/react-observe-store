import chai from 'chai';
import observeStore from '../react-observe-store';
import sinon from 'sinon';
var expect = chai.expect;

import stripLastPropertyAcessorSpec from './util/stripLastPropertyAcessor.spec';

describe('react-observe-store', function() {
	var comp;
	var store;
	var prepareFakeComponent = function(renderFn){
    store = {
      c: 0,
      arr: [0, 1],
      obj: {
        count: 0
      },
      d: 2,
      prop: 'a'
    };

    comp = {
      forceUpdate: sinon.spy(),
      render: renderFn
    };
    observeStore(comp, store, 'store');
	};
  var renderNormallyComplex = function() {
    var style = {prop: store.d, size: 20};
    style[store.prop] = 15;
    return <div>
      <span>counter is {store.c}</span>
      <button onClick={this.increment}>Increment</button>
      <button onClick={this.decrement}>Decrement</button>
      <br/>
      <span>arr has {store.arr}</span>
      <button onClick={this.push}>push</button>
      <button onClick={this.pop}>pop</button>
      <br/>
      <span>obj is {JSON.stringify(store.obj)}</span>
      <button onClick={this.incrementObj}>Increment object prop</button>
      <button onClick={this.decrementObj}>Decrement object prop</button>

    </div>;
  };
	describe('calling forceUpdate on a component', function() {

		it('should work for simple values', function(done) {
      prepareFakeComponent(renderNormallyComplex);
      store.c += 1;
			store.c += 1;	//will trigger only one, we don't want to force update multiple times in this case

			setTimeout(function(){
				expect(comp.forceUpdate.callCount).to.equal(1);
				store.c += 1;

				setTimeout(function(){
					expect(comp.forceUpdate.callCount).to.equal(2);
					done();
				});
			});
		});
		it('should work for objects', function(done) {
      prepareFakeComponent(renderNormallyComplex);
      store.obj.count += 1;
			setTimeout(function(){
				expect(comp.forceUpdate.callCount).to.equal(1);
				done();
			});
		});

    it('should work when store used inside an object literal', function(done) {
      prepareFakeComponent(renderNormallyComplex);

      store.d += 1;
      setTimeout(function() {
        expect(comp.forceUpdate.callCount).to.equal(1);
        done();
      });
    });

    it('should register when store used as a key within bracket notation', function(done){
      prepareFakeComponent(renderNormallyComplex);

      store.prop = 'b';
      setTimeout(function() {
        expect(comp.forceUpdate.callCount).to.equal(1);
        done();
      });
    });

		describe('arrays', function() {
			it('should work for arrays', function(done) {
        prepareFakeComponent(renderNormallyComplex);

        store.arr.push(store.arr.length + 1);
				setTimeout(function(){
					expect(comp.forceUpdate.callCount).to.equal(1);
					done();
				});
			});

      it('should work for array method map(but watch the array)', function(done) {
        prepareFakeComponent(function() {
          return <ul>{store.arr.map((number)=> {
            <li key={number}>{number}</li>
          })}</ul>;
        });

        store.arr.push(store.arr.length + 1);
        setTimeout(function() {
          expect(comp.forceUpdate.callCount).to.equal(1);
          done();
        });
      });

      it('should work for array methods(but watch the array) even when they are accessed with square bracket syntax', function(done) {
        prepareFakeComponent(function() {
          return <ul>{store.arr['map']((number)=> {
            <li key={number}>{number}</li>
          })}</ul>;
        });

        store.arr.push(store.arr.length + 1);
        setTimeout(function() {
          expect(comp.forceUpdate.callCount).to.equal(1);
          done();
        });
      });
		});

	});

	describe('regex matcher', function() {
		it('should match when accessing a prop by index(brackets)', function() {

		});
		it('should match when accessing a prop by dot notation', function() {

		});
	});
	
	describe('multiple components using one store', function() {
		it('should only create one observer if two components are observing the same path', function(){
		    //TODO implement(not even implemented in the algorithm itself)
		});
		
		it('should not close the observer if one of the two components is unmounted', function(){
			//TODO implement(not even implemented in the algorithm itself)
		});
		
		it('should close the observer when all of the components are unmounted', function(){
			//TODO implement(not even implemented in the algorithm itself)
		});
	});
});