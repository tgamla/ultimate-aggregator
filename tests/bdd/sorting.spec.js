var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Sorting', () => {

    describe('FIRST', () => {
        it('Get first invoice grouped by region and ordered by value from first 10 rows', () => {
            var result = new ua.Query()
                .select('FIRST(row.invoiceNo)ORDER_BY(row.invoiceNo)')
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/4/2015", "1/10/2015", "1/2/2015" ])
                );
        });

        it('Get first invoice ordered by department, row id, grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'FIRST(row.invoiceNo) ORDER_BY (row.department, row.id)'
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/5/2017"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/2/2015"
                    }
                ])
            );
        });

        it('Get first invoice OVER all grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'FIRST(row.invoiceNo) OVER() ORDER_BY (row.id)'
                })
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/6/2016"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016"
                    }
                ])
            );
        });

        it('Get first invoice number ordered descending by invoice number from first 10 rows', () => {
            var result = new ua.Query()
                .select('FIRST(row.invoiceNo)ORDER_BY(DESC)')
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "2/4/2015" ])
                );
        });
    });

    describe('LAST', () => {
        it('Get last invoice grouped by region and ordered by value from first 10 rows', () => {
            var result = new ua.Query()
                .select('LAST(row.invoiceNo)ORDER_BY(row.invoiceNo)')
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/6/2017", "2/4/2015", "1/9/2017" ])
                );
        });

        it('Get last invoice ordered by department, row id, grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'LAST(row.invoiceNo) ORDER_BY (row.department, row.id)'
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { "region": "Germany", "invoiceNo": "1/4/2015" },
                    { "region": "Poland", "invoiceNo": "1/10/2015" },
                    { "region": "France", "invoiceNo": "1/9/2017" }
                ])
            );
        });

        it('Get last invoice OVER all grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'LAST(row.invoiceNo) OVER() ORDER_BY (row.id)'
                })
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/10/2015"
                    }
                ])
            );
        });

        it('Get last invoice number ordered descending by invoice number from first 10 rows', () => {
            var result = new ua.Query()
                .select('LAST(row.invoiceNo)ORDER_BY(DESC)')
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/10/2015" ])
                );
        });
    });

    describe('CONCAT', () => {
        it('Get concatenation of invoices ordered by value and grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select('CONCAT(row.invoiceNo)ORDER_BY(row.invoiceNo)')
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    "1/4/2015, 1/6/2016, 1/6/2017",
                    "1/10/2015, 1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015",
                    "1/2/2015, 1/9/2017"
                ])
            );
        });

        it('Get concatenation of invoices ordered by department, row id, grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'CONCAT(row.invoiceNo) ORDER_BY (row.department, DESC)'
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2017, 1/6/2016, 1/4/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"2/4/2015, 1/5/2017, 1/12/2017, 1/11/2016, 1/10/2015"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/2/2015, 1/9/2017"
                    }
                ])
            );
        });

        it('Get concatenation of invoices OVER all grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'CONCAT(row.invoiceNo) OVER() ORDER_BY (row.id)'
                })
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                    }
                ])
            );
        });

        it('Get concatenation of invoices ordered descending by invoice number from first 10 rows', () => {
            var result = new ua.Query()
                .select('CONCAT(row.invoiceNo)ORDER_BY(DESC)')
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "2/4/2015, 1/9/2017, 1/6/2017, 1/6/2016, 1/5/2017, 1/4/2015, 1/2/2015, 1/12/2017, 1/11/2016, 1/10/2015" ])
                );
        });
    });

    describe('NTH', () => {
        it('Get 2nd invoice number ordered by row id and grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select('NTH(row.invoiceNo, 2)ORDER_BY(row.id)')
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/4/2015", "1/12/2017", "1/9/2017" ])
            );
        });

        it('Get 3rd invoice number ordered by department, row id, grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'NTH(row.invoiceNo, 3) ORDER_BY (row.department, DESC)'
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/4/2015"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/12/2017"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":null
                    }
                ])
            );
        });

        it('Get 7th of invoice number ordered by row id OVER all and grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: 'NTH(row.invoiceNo, 7) OVER() ORDER_BY (row.id)'
                })
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Germany",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"France",
                        "invoiceNo":"1/6/2017"
                    },
                    {  
                        "region":"Poland",
                        "invoiceNo":"1/6/2017"
                    }
                ])
            );
        });

        it('Get 1st invoice number ordered descending by invoice number from first 10 rows', () => {
            var result = new ua.Query()
                .select('NTH(row.invoiceNo, 1)ORDER_BY(DESC)')
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify(["2/4/2015"])
                );
        });
    });

    describe('Mixed', () => {

        // TODO::
    });
  });