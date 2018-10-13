var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test grouping', () => {

    it('First 10 rows amount per department', () => {
        var result = ua.query()
            .select('row.invoiceAmount')
            .groupBy('row.department')
            .from(testData.slice(0, 10))
            .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 16.65, 210.9, 17.2 ])
            );
    });

    it('Group first 10 rows by region and group by department as direct subselector', () => {
        var result = ua.query()
            .select(ua.group('row.department').by('row.department'))
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 10))
            .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    [ "Sales - Y", "Sales - X" ],
                    [ "Sales - Z", "Sales - X" ],
                    [ "Sales - Y", "Sales - Z" ]
                ])
            );
    });

    it('First 20 rows by department along with inner grouping', () => {
        var result = ua.query().select({
            departmentRegion: 'row.departmentRegion',
            amount: '(row.invoiceAmount).toFixed(2) + " " + row.currency',
            departmentAmount: ua.group('(row.invoiceAmount).toFixed(2) + " " + row.currency').by('row.department')
        }).groupBy('row.departmentRegion').from(testData.slice(0, 20)).toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([
                {
                    "departmentRegion": "Germany",
                    "amount": "103.60 EUR",
                    "departmentAmount": [ "103.60 EUR", "94.97 EUR" ]
                },
                {
                    "departmentRegion": "Poland",
                    "amount": "308.00 PLN",
                    "departmentAmount": [ "308.00 PLN", "347.60 PLN" ]
                },
                {
                    "departmentRegion": "France",
                    "amount": "58.00 EUR",
                    "departmentAmount": [ "58.00 EUR", "3.58 EUR" ]
                }
            ])
        );
    });

    it('Select last invoices per region where Query has no grouping', () => {
        var result = ua.query()
            .select({
                regions: ua.group({
                    region: 'row.departmentRegion',
                    invoiceNo: 'row.invoiceNo'
                }).by('row.departmentRegion')
            })
            .groupBy('ALL')
            .from(testData.slice(0, 10))
            .toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([
                {
                    "regions": [
                        { "region": "Germany", "invoiceNo": "1/6/2017" },
                        { "region": "Poland", "invoiceNo": "1/10/2015" },
                        { "region": "France", "invoiceNo": "1/9/2017" }
                    ]
                }
            ])
        );
    });

    it('Select two groups with different grouping order', () => {
        var result = ua.query()
            .select([
                ua.group('SUM(row.invoiceAmount)').by(['row.accountId', 'row.department']),
                ua.group('SUM(row.invoiceAmount)').by(['row.department', 'row.accountId'])
			])
            .groupBy()
            .from(testData.slice(0, 10))
            .toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([
                [
                    [253.7,17.2,305.6,376.59999999999997,16.65,69.525,94.975,52.725,0.2],
                    [16.65,69.525,0.2,305.6,376.59999999999997,52.725,253.7,17.2,94.975]
                ]
            ])
        );
    });
    
    // TODO:: multiple groupings + multiple inner groupings
});