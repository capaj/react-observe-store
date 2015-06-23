import observeStore from '../react-observe-store';
import mocha from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
mocha.setup('bdd');
var expect = chai.expect;

describe('react-observe-store', function() {
	describe('calling forceUpdate on a component', function() {
		var comp;
		var store;

		beforeEach(function() {
			store = {
				c: 0,
				arr: [0, 1],
				obj: {
					count: 0
				}
			};

			comp = {
				forceUpdate: sinon.spy(),
				render: function() {
					return <div>
						<span>counter is {state.c}</span>
						<button onClick={this.increment}>Increment</button>
						<button onClick={this.decrement}>Decrement</button>
						<br/>
						<span>arr has {state.arr}</span>
						<button onClick={this.push}>push</button>
						<button onClick={this.pop}>pop</button>
						<br/>
						<span>obj is {JSON.stringify(state.obj)}</span>
						<button onClick={this.incrementObj}>Increment object prop</button>
						<button onClick={this.decrementObj}>Decrement object prop</button>

					</div>;
				}
			};
			observeStore(comp, store, 'state');
		});

		it('should work for simple values', function(done) {
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
		it('should work for objects', function() {
			//TODO implement
		});
		it('should work for arrays', function() {
			//TODO implement
		});
	});

	describe('regex matcher', function() {
		it('should match when accessing a prop by index(brackets)', function() {

		});
		it('should match when accessing a prop by dot notation', function() {

		});
	});
});