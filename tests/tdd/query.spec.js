const assert = require('assert');
const Query = require('../../bin/query').Query;
const Group = require('../../bin/group').Group;
const Ungroup = require('../../bin/ungroup').Ungroup;
const ExpressionType = require('../../bin/constants/expressionType').ExpressionType;


describe('Test Query', () => {
    
    describe('Siblings', () => {

        it('match siblings from different groups', () => {
            var query = (new Query())
                .select({
                    regions: 'FIRST(CONCAT(row.departmentRegion))',
                    departments: new Ungroup({
                        department: 'row.department',
                        depRegions: 'FIRST(CONCAT(row.departmentRegion) OVER(row.departmentRegion))'
                    })
                })
                .groupBy('row.departmentRegion');
            
            query.calculate();
            var allAggregations = query.allExpressions.filter((exp) => exp.type === ExpressionType.AGGREGATE);

            assert.equal(allAggregations.length, 2);
        });

        it('match siblings from different groups both with OVER', () => {
            var query = (new Query())
                .select({
                    regionsInvoices: new Ungroup('row.invoiceNo'),
                    department: 'FIRST(SUM(row.invoiceAmount) OVER (row.department, row.accountId))',
                    sellers: new Group('SUM(row.invoiceAmount) OVER (row.department, row.accountId)').by([ 'row.department', 'row.accountId' ])
                })
                .groupBy([ 'row.departmentRegion' ]);
            
            query.calculate();
            var allAggregations = query.allExpressions.filter((exp) => exp.type === ExpressionType.AGGREGATE);

            assert.equal(allAggregations.length, 2);
        });
    });

    describe('addContext', () => {

        it('Pass function as reference', () => {
            var results = (new Query())
                .select('toString(row)')
                .from([1, 2, 3])
                .addContext(function toString(val) { return val.toString(); })
                .toList();

            assert.equal(
                JSON.stringify(results),
                JSON.stringify(["1","2","3"])
                );
        });

        it('Pass object as reference', () => {
            var results = (new Query())
                .select('x + row + y')
                .from([1, 2, 3])
                .addContext({
                    x: 'x',
                    y: 'y'
                })
                .toList();

            assert.equal(
                JSON.stringify(results),
                JSON.stringify(["x1y","x2y","x3y"])
                );
        });

        it('Pass string as value', () => {
            var results = (new Query())
                .select('one + row')
                .from([1, 2, 3])
                .addContext('one', 1)
                .toList();

            assert.equal(
                JSON.stringify(results),
                JSON.stringify([2,3,4])
                );
        });
    });

    describe('from', () => {

        it('Pass unsuported data type', () => {
            var query = (new Query({ logLevel: 0 }))
                .select('row')
                .from(null)
                .from('')
                .from(undefined)
                .from(12)
                .from(NaN)
                .from(function() {});

            assert.equal(
                JSON.stringify(query.dataSource),
                JSON.stringify([])
                );
        });

        it('Pass object', () => {
            var query = (new Query())
                .select('row')
                .from({ x: 1 });

            assert.equal(
                JSON.stringify(query.dataSource),
                JSON.stringify({ x: 1 })
                );
        });

        it('Pass array', () => {
            var query = (new Query())
                .select('row')
                .from([1, 2, 3]);

            assert.equal(
                JSON.stringify(query.dataSource),
                JSON.stringify([1,2,3])
                );
        });
    });

    describe('Clearing', () => {

        it('PreFilter', () => {
            var query = (new Query())
                .preFilter('row.departmentRegion !== "Germany"');
            
            query.preFilter();

            assert.equal(
                query._preFilter,
                null
            );
        });

        it('Distinct', () => {
            var query = (new Query())
                .distinct(true);
            
            query.distinct();

            assert.equal(
                query._distinct,
                false
            );
        });

        it('Grouping', () => {
            var query = (new Query())
                .groupBy('row.departmentRegion');
            
            query.groupBy();

            assert.equal(
                JSON.stringify(query._groupBy),
                JSON.stringify([])
            );
        });

        it('Sorting', () => {
            var query = (new Query())
                .orderBy('row.departmentRegion');
            
            query.orderBy();

            assert.equal(
                JSON.stringify(query._orderBy),
                JSON.stringify([])
            );
        });
    });
});

describe('Test parsing:', () => {
    // TODO:: 
});
