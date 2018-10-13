var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test indexing', () => {

    it('Concat all indexes in region for first 10 rows', () => {
        var result = ua.query()
            .select('CONCAT(index)')
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 10))
            .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    "1, 6, 7",
                    "2, 4, 5, 8, 10",
                    "3, 9"
                ])
            );
    });

    it('Concat all groupIndexes per region for first 10 rows', () => {
        var result = ua.query()
            .select('CONCAT(groupIndex)')
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 10))
            .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    "1, 2, 3",
                    "1, 2, 3, 4, 5",
                    "1, 2"
                ])
            );
    });

    it('Get last groupIndexes per region for first 10 rows', () => {
        var result = ua.query()
            .select('groupIndex')
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 10))
            .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 3, 5, 2 ])
            );
    });
});