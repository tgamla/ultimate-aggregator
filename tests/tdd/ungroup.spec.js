const assert = require('assert');
const Ungroup = require('../../bin/ungroup').Ungroup;

describe('Test Ungroup', () => {

    describe('Clearing', () => {
    
        it('Sorting', () => {
            var ungroup = new Ungroup('null').orderBy('row');
            ungroup.orderBy();
    
            assert.equal(
                JSON.stringify(ungroup._orderBy),
                JSON.stringify([])
            );
        });
    
        it('Distinct', () => {
            var ungroup = new Ungroup('null').distinct(true);
            ungroup.distinct();
    
            assert.equal(
                ungroup._distinct,
                false
            );
        });
    
        it('Filter', () => {
            var ungroup = new Ungroup('null').filter('row !== null');
            ungroup.filter();
    
            assert.equal(
                ungroup._filter,
                null
            );
        });
    });
});
