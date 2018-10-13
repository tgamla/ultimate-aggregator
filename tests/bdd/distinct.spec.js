var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test distinct', () => {

    describe('Query distinct', () => {
        
        it('Get all regions for first 10 rows', () => {
            var results = ua.query()
                .select('row.departmentRegion')
                .distinct(true)
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify(["Germany","Poland","France"])
            );
        });
    });

    describe('Group distinct', () => {

        it('Get first departments (alphabeticaly) per region for first 10 rows', () => {
            var results = ua.query()
                .select(ua.group('MIN(row.department)').by('row.departmentRegion').distinct(true))
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([["Sales - X","Sales - Y"]])
            );
        });
    });

    describe('Ungroup distinct', () => {

        it('Get all departments per region for first 10 rows', () => {
            var results = ua.query()
                .select(ua.ungroup('row.department').distinct(true))
                .groupBy('row.departmentRegion')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([
                    ["Sales - Y","Sales - X"],
                    ["Sales - Z","Sales - X"],
                    ["Sales - Y","Sales - Z"]
                ])
            );
        });
    });

    describe('Aggregate function DISTINCT', () => {

        it('Get concatenated regions with DISTINCT for first 10 rows', () => {
            var results = ua.query()
                .select('CONCAT(DISTINCT  row.departmentRegion)')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify(["Germany, Poland, France"])
            );
        });

        it('Get avarage of floored index with DISTINCT for first 10 rows', () => {
            var results = ua.query()
                .select('AVG(DISTINCT Math.floor((index - 1)/5))')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([ 0.5 ])
            );
        });

        it('Get count DISTINCT regions for first 10 rows', () => {
            var results = ua.query()
                .select('COUNT(DISTINCT row.departmentRegion)')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([ 3 ])
            );
        });

        it('Get sum of floored index with DISTINCT for first 10 rows', () => {
            var results = ua.query()
                .select('SUM(DISTINCT Math.floor(index / 5))')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([ 3 ])
            );
        });

        it('Get 3rd department with DISTINCT for first 10 rows', () => {
            var results = ua.query()
                .select('NTH(DISTINCT row.departmentRegion, 3)')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([ "France" ])
            );
        });

        it('Get concatenated regions with DISTINCT ordered by VALUE for first 10 rows', () => {
            var results = ua.query()
                .select('CONCAT(DISTINCT row.departmentRegion)ORDER_BY()')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([ "France, Germany, Poland" ])
            );
        });

        it('Get 3rd region with DISTINCT ordered by VALUE descending for first 10 rows', () => {
            var results = ua.query()
                .select('NTH(DISTINCT row.departmentRegion, 3)ORDER_BY(DESC)')
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([ "France" ])
            );
        });
    });
});
