var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test filtering', () => {

    describe('Query preFilter', () => {
        
        it('Get invoice from Poland region for 30 first rows', () => {
            var results = ua.query()
                .preFilter('row.departmentRegion === "Poland"')
                .select('row.invoiceNo')
                .from(testData.slice(0, 30))
                .toList();

            assert.equal(
                JSON.stringify(results),
                JSON.stringify(["1/11/2016","1/12/2017","1/5/2017","2/4/2015","1/10/2015","1/8/2017","1/3/2016","2/5/2017","2/10/2015","2/11/2016","1/7/2016"])
            );
        });

        it('Get ungrouped invoices per department from Poland region for 30 first rows', () => {
            var results = ua.query()
                .preFilter('row.departmentRegion === "Poland"')
                .select(ua.ungroup('row.invoiceNo'))
                .from(testData.slice(0, 30))
                .groupBy('row.department')
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([
                    ["1/11/2016","1/12/2017","1/10/2015","1/3/2016"],
                    ["1/5/2017","2/4/2015","1/8/2017","2/11/2016","1/7/2016"],
                    ["2/5/2017","2/10/2015"]
                ])
            );
        });

        it('Get concatenated invoices per department from Poland region for 30 first rows', () => {
            var results = ua.query()
                .preFilter('row.departmentRegion === "Poland"')
                .select(ua.group('CONCAT(row.invoiceNo)').by('row.department'))
                .from(testData.slice(0, 30))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([
                    [ "1/11/2016, 1/12/2017, 1/10/2015, 1/3/2016", "1/5/2017, 2/4/2015, 1/8/2017, 2/11/2016, 1/7/2016", "2/5/2017, 2/10/2015" ]
                ])
            );
        });
    });

    describe('Query filter', () => {

        it('Select invoices only from department "Sales - Z" for first 10 rows', () => {
            var results = ua.query()
                .select({ department: 'row.department', invoice: 'row.invoiceNo' })
                .from(testData.slice(0, 10))
                .filter('out.department === "Sales - Z"')
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([
                    {"department":"Sales - Z","invoice":"1/11/2016"},
                    {"department":"Sales - Z","invoice":"1/12/2017"},
                    {"department":"Sales - Z","invoice":"1/9/2017"},
                    {"department":"Sales - Z","invoice":"1/10/2015"}
                ])
            );
        });
    });

    describe('Group filter', () => {

        it('Select invoices only from department "Sales - Z" per each region for first 30 rows', () => {
            var results = ua.query()
                .select(
                    ua.group({
                        invoice: 'row.invoiceNo',
                        department: 'row.department'
                    })
                    .orderBy('out.invoice')
                    .by(['row.department', 'row.invoiceNo'])
                    .filter('out.department === "Sales - Z"')
                )
                .from(testData.slice(0, 30))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([[
                    {"invoice":"1/10/2015","department":"Sales - Z"},
                    {"invoice":"1/11/2016","department":"Sales - Z"},
                    {"invoice":"1/12/2017","department":"Sales - Z"},
                    {"invoice":"1/3/2015","department":"Sales - Z"},
                    {"invoice":"1/3/2016","department":"Sales - Z"},
                    {"invoice":"1/5/2016","department":"Sales - Z"},
                    {"invoice":"1/7/2015","department":"Sales - Z"},
                    {"invoice":"1/8/2015","department":"Sales - Z"},
                    {"invoice":"1/9/2017","department":"Sales - Z"},
                    {"invoice":"2/12/2017","department":"Sales - Z"},
                    {"invoice":"2/8/2017","department":"Sales - Z"},
                    {"invoice":"3/12/2017","department":"Sales - Z"}
                ]])
            );
        });
    });

    describe('Ungroup filter', () => {

        it('Select invoices only from department "Sales - Z" per each region for first 30 rows', () => {
            var results = ua.query()
                .select(
                    ua.ungroup({
                        invoice: 'row.invoiceNo',
                        department: 'row.department'
                    })
                    .orderBy('out.invoice')
                    .filter('out.department === "Sales - Z"')
                )
                .groupBy('row.departmentRegion')
                .from(testData.slice(0, 30))
                .toList();

            assert.equal(
                JSON.stringify(results), 
                JSON.stringify([
                    [],
                    [{"invoice":"1/10/2015","department":"Sales - Z"},{"invoice":"1/11/2016","department":"Sales - Z"},{"invoice":"1/12/2017","department":"Sales - Z"},{"invoice":"1/3/2016","department":"Sales - Z"}],
                    [{"invoice":"1/3/2015","department":"Sales - Z"},{"invoice":"1/5/2016","department":"Sales - Z"},{"invoice":"1/7/2015","department":"Sales - Z"},{"invoice":"1/8/2015","department":"Sales - Z"},{"invoice":"1/9/2017","department":"Sales - Z"},{"invoice":"2/12/2017","department":"Sales - Z"},{"invoice":"2/8/2017","department":"Sales - Z"},{"invoice":"3/12/2017","department":"Sales - Z"}]
                ])
            );
        });
    });
});
