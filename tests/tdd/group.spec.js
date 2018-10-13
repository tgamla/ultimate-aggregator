const assert = require('assert');
const Group = require('../../bin/group').Group;

describe('Test Group', () => {

    describe('Clearing', () => {

        it('Grouping', () => {
            var group = new Group('null').by('row');
            group.by();
    
            assert.equal(
                JSON.stringify(group._groupBy),
                JSON.stringify([])
            );
        });
    
        it('Sorting', () => {
            var group = new Group('null').orderBy('row');
            group.orderBy();
    
            assert.equal(
                JSON.stringify(group._orderBy),
                JSON.stringify([])
            );
        });
    
        it('Distinct', () => {
            var group = new Group('null').distinct(true);
            group.distinct();
    
            assert.equal(
                group._distinct,
                false
            );
        });
    
        it('Filter', () => {
            var group = new Group('null').filter('row !== null');
            group.filter();
    
            assert.equal(
                group._filter,
                null
            );
        });
    });
});
