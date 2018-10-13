var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test datasource', () => {

    describe('Query from', () => {
        
        it('No datasource defined wit query as list', () => {
            var results = ua.query()
                .select('index')
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([])
            );
        });
    });

    describe('SubQueries', () => {

        it('from defined within subQuery', () => {
            var subQuery = ua.query()
                .select('row.departmentRegion')
                .distinct(true)
                .orderBy('ASC')
                .from(testData.slice(0, 10));

            var results = ua.query()
                .select('CONCAT(row)')
                .from(subQuery)
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify(["France, Germany, Poland"])
            );
        });

        it('Pass data to execute of parents query with subQuery', () => {
            var subQuery = ua.query()
                .select('row.departmentRegion')
                .distinct(true)
                .orderBy('ASC')
                .from([1,2,3]);

            var results = ua.query()
                .select('CONCAT(row)')
                .from(subQuery)
                .execute(testData.slice(0, 10));

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify(["France, Germany, Poland"])
            );
        });
    });
});
