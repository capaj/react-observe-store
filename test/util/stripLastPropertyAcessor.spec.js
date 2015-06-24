import chai from 'chai';
var expect = chai.expect;
import stripLastPropertyAcessor from '../../util/stripLastPropertyAcessor'

describe('stripLastPropertyAcessor', function() {
    it('should strip last property', function(){
        expect(stripLastPropertyAcessor('arr["map"]["map"]')).to.equal('arr["map"]');
        expect(stripLastPropertyAcessor('arr.map')).to.equal('arr');
    });
});