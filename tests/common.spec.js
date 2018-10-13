var assert = require('assert');
var ua = require('../bin/aggregator');
var testData = require('./testData');

describe('Test common issues', () => {

    it('Check for leftovers in global', () => {

        var preProcessingWindowProps = Object.keys(global);

        executeQuery();

        var postProcessingWindowProps = Object.keys(global);

        assert.equal(
            JSON.stringify(preProcessingWindowProps),
            JSON.stringify(postProcessingWindowProps)
        );
    });
    /* TODO::
    it('Check for memory leaks', () => {
        console.log(JSON.stringify(process.memoryUsage()));
        for (var i = 0; i < 1000; i++)
            executeQuery();
        console.log(JSON.stringify(process.memoryUsage()));
        global.gc(true);
        console.log(JSON.stringify(process.memoryUsage()));
    });
    */
});

function executeQuery() {
    ua.query()
        .select({
            region: 'row.departmentRegion',
            regionFirst: 'FIRST(row.departmentRegion)',
            departments: ua.group({
                department: 'row.department',
                invoices: 'CONCAT(row.invoiceNo)',
                sellerInvoices: ua.ungroup({
                    seller: 'row.userName + " " + row.userSurname',
                    amount: 'row.invoiceAmount',
                    invoiceNo: 'row.invoiceNo',
                    total: 'SUM(row.invoiceAmount) OVER (row.accountId)'
                })
            }).by('row.department')
        })
        .from(testData.slice(0, 50))
        .groupBy('row.departmentRegion')
        .toList();
}
