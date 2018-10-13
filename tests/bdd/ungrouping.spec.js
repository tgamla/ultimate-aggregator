var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test ungrouping', () => {

    it('Group first 10 rows by region and ungroup invoices as subselector', () => {
        var result = ua.query()
            .select({
                region: 'row.departmentRegion',
                invoices: ua.ungroup('row.invoiceNo')
            })
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 10))
            .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "region": "Germany",
                        "invoices": [ "1/6/2016", "1/4/2015", "1/6/2017" ]
                    },
                    {
                        "region": "Poland",
                        "invoices": [ "1/11/2016", "1/12/2017", "1/5/2017", "2/4/2015", "1/10/2015" ]
                    },
                    {
                        "region": "France",
                        "invoices": [ "1/2/2015", "1/9/2017" ]
                    }
                ])
            );
    });

    it('Group first 10 rows by region and ungroup invoices as direct subselector', () => {
        var result = ua.query()
            .select(ua.ungroup('row.invoiceNo'))
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 10))
            .toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([
                [ "1/6/2016", "1/4/2015", "1/6/2017" ],
                [ "1/11/2016", "1/12/2017", "1/5/2017", "2/4/2015", "1/10/2015" ],
                [ "1/2/2015", "1/9/2017" ]
            ])
        );
    });

    it('Group first 20 rows by region and department as direct subselector and ungroup invoices as direct subselector of group', () => {
        var result = ua.query()
            .select(
                ua.group(
                    ua.ungroup('row.invoiceNo')
                ).by('row.department')
            )
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 20))
            .toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([
                [
                    [ "1/6/2016", "1/4/2015", "1/2/2017", "1/10/2017", "2/10/2017" ],
                    [ "1/6/2017" ]
                ],
                [
                    [ "1/11/2016", "1/12/2017", "1/10/2015", "1/3/2016" ],
                    [ "1/5/2017", "2/4/2015", "1/8/2017" ]
                ],
                [
                    [ "1/2/2015", "1/9/2016" ],
                    [ "1/9/2017", "1/5/2016", "2/12/2017", "1/3/2015", "2/8/2017" ]
                ]
            ])
        );
    });

    it('Group 20 first rows by department region and ungroup invoices amount as subselector', () => {
        var result = ua.query()
            .select({
                region: 'row.departmentRegion',
                departmentAmount: ua.ungroup('(row.invoiceAmount).toFixed(2) + " " + row.currency')
            })
            .groupBy('row.departmentRegion')
            .from(testData.slice(0, 20))
            .toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([
                {
                    "region": "Germany",
                    "departmentAmount": [ "69.53 EUR", "16.65 EUR", "94.97 EUR", "99.95 EUR", "102.88 EUR", "103.60 EUR" ]
                },
                {
                    "region": "Poland",
                    "departmentAmount": [ "376.60 PLN", "94.70 PLN", "253.70 PLN", "17.20 PLN", "210.90 PLN", "347.60 PLN", "308.00 PLN" ]
                },
                {
                    "region": "France",
                    "departmentAmount": [ "0.20 EUR", "52.73 EUR", "72.33 EUR", "125.72 EUR", "56.35 EUR", "3.58 EUR", "58.00 EUR" ]
                }
            ])
        );
    });

    it('Ungroup first 10 invoices where Query has no grouping', () => {
        var result = ua.query()
            .select(ua.ungroup('row.invoiceNo'))
            .groupBy()
            .from(testData.slice(0, 10))
            .toList();
        
        assert.equal(
            JSON.stringify(result),
            JSON.stringify([["1/6/2016","1/11/2016","1/2/2015","1/12/2017","1/5/2017","1/4/2015","1/6/2017","2/4/2015","1/9/2017","1/10/2015"]])
        );
    });
    
    // TODO:: multiple groupings + multiple inner groupings
});