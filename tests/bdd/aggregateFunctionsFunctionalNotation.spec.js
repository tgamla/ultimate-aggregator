var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Aggregate functions - functional notation', () => {

    describe('FIRST', () => {
        it('Get first invoice grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.first('row.invoiceNo'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/6/2016", "1/11/2016", "1/2/2015" ])
                );
        });

        it('Get first invoice with region grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: ua.first('row.invoiceNo')
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { "region": "Germany", "invoiceNo": "1/6/2016" },
                    { "region": "Poland", "invoiceNo": "1/11/2016" },
                    { "region": "France", "invoiceNo": "1/2/2015" }
                ])
            );
        });

        it('Get first invoice with 7th position from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.first('row.positions[6] ? row.positions[6].amount : null'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 33.800000000000004 ])
                );
        });

        it('Get first invoice with 7th position ordered by amount for first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.first('row.positions[6] ? row.positions[6].amount : null').over([]).orderBy(''))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ null, null, null, null, null, null, null, null, null, null ])
                );
        });

        it('Get first invoice with 7th position ordered by amount descending for first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.first('row.positions[6] ? row.positions[6].amount : null').over([]).orderBy('DESC'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, ])
                );
        });

        it('Get first invoiceNo ordered by Region and invoiceNo descending for first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.first('row.invoiceNo').over('').orderBy(['row.departmentRegion', ' DESC']))
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify(["1/9/2017","1/9/2017","1/9/2017","1/9/2017","1/9/2017","1/9/2017","1/9/2017","1/9/2017","1/9/2017","1/9/2017"])
                );
        });

        it('Get first value which is undefined', () => {
            var result = new ua.Query()
                .select(ua.first('row'))
                .from([ undefined, 1, 2 ])
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ undefined ])
                );
        });
    });

    describe('LAST', () => {
        it('Get last invoice grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.last('row.invoiceNo'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/6/2017", "1/10/2015", "1/9/2017" ])
                );
        });

        it('Get last invoice with region grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: ua.last('row.invoiceNo')
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { "region": "Germany", "invoiceNo": "1/6/2017" },
                    { "region": "Poland", "invoiceNo": "1/10/2015" },
                    { "region": "France", "invoiceNo": "1/9/2017" }
                ])
            );
        });

        it('Get last invoice 7th position from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.last('row.positions[6]'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "productId": 7,
                        "description": "Blueberries",
                        "quantity": 21,
                        "amount": 27.3
                    }
                ])
            );
        });

        it('Get last invoice with 7th position ordered by amount from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.last('row.positions[6] ? row.positions[6].amount : null').over('').orderBy(''))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7, 102.7 ])
                );
        });

        it('Get last invoice with 7th position ordered by amount descending from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.last('row.positions[6] ? row.positions[6].amount : null').over('').orderBy('DESC'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ null, null, null, null, null, null, null, null, null, null ])
                );
        });

        it('Get last invoiceNo ordered by Region and invoiceNo descending from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.last('row.invoiceNo').over('').orderBy(['row.departmentRegion', 'DESC']))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015", "1/10/2015" ])
                );
        });
    });

    describe('NTH', () => {
        it('Get 3rd invoice number grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.nth('row.invoiceNo', '3'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/6/2017", "1/5/2017", null ])
                );
        });

        it('Get 3rd invoice number with region grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoiceNo: ua.nth('row.invoiceNo', 3)
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
                        "invoiceNo":null
                    }
                ])
            );
        });

        it('Get 7th invoice row id from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.nth('row.id', '7'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 7 ])
            );
        });

        it('Get 3rd invoice with 7th position ordered by amount from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.nth('row.positions[6] ? row.positions[6].amount : null', 3).over('').orderBy(''))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ null, null, null, null, null, null, null, null, null, null ])
                );
        });

        it('Get 3rd invoice with 7th position ordered by amount descending from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.nth('row.positions[6] ? row.positions[6].amount : null', 3).over('').orderBy('DESC'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3, 27.3 ])
                );
        });

        it('Get 3rd invoiceNo ordered by Region and invoiceNo descending from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.nth('row.invoiceNo', 3).over('').orderBy(['row.departmentRegion', 'DESC']))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017", "1/6/2017" ])
                );
        });
    });

    describe('CONCAT', () => {
        it('Get concatenated invoices grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.concat('row.invoiceNo'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    "1/6/2016, 1/4/2015, 1/6/2017",
                    "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                    "1/2/2015, 1/9/2017"
                ])
            );
        });

        it('Get concatenated invoices with region grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoices: ua.concat('row.invoiceNo')
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "region": "Germany",
                        "invoices": "1/6/2016, 1/4/2015, 1/6/2017"
                    },
                    {
                        "region": "Poland",
                        "invoices": "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015"
                    },
                    {
                        "region": "France",
                        "invoices": "1/2/2015, 1/9/2017"
                    }
                ])
            );
        });

        it('Get concatenated invoices OVER region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.concat('row.invoiceNo').over('row.departmentRegion'))
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    "1/6/2016, 1/4/2015, 1/6/2017",
                    "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                    "1/2/2015, 1/9/2017",
                    "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                    "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                    "1/6/2016, 1/4/2015, 1/6/2017",
                    "1/6/2016, 1/4/2015, 1/6/2017",
                    "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                    "1/2/2015, 1/9/2017",
                    "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015"
                ])
            );
        });

        it('Get concatenated invoices OVER ALL with query grouping by all', () => {
            var result = new ua.Query()
                .select([ua.concat('row.invoiceNo')])
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([["1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"]])
            );
        });

        it('Get concatenated invoices OVER ALL as per each invoice', () => {
            var result = new ua.Query()
                .select(ua.concat('row.invoiceNo').over('ALL'))
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015",
                    "1/6/2016, 1/11/2016, 1/2/2015, 1/12/2017, 1/5/2017, 1/4/2015, 1/6/2017, 2/4/2015, 1/9/2017, 1/10/2015"
                ])
            );
        });

        it('Get concatatenation of 7th position of each invoice from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.concat('row.positions[6] ? row.positions[6].amount : null'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ "33.800000000000004, 102.7, 2.275, 27.3" ])
                );
        });

        it('Get concatenation of invoicesNo ordered by VALUE from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.group(ua.concat('row.invoiceNo').over('').orderBy('')).by('row.departmentRegion'))
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([[
                    "1/10/2015, 1/11/2016, 1/12/2017, 1/2/2015, 1/4/2015, 1/5/2017, 1/6/2016, 1/6/2017, 1/9/2017, 2/4/2015",
                    "1/10/2015, 1/11/2016, 1/12/2017, 1/2/2015, 1/4/2015, 1/5/2017, 1/6/2016, 1/6/2017, 1/9/2017, 2/4/2015",
                    "1/10/2015, 1/11/2016, 1/12/2017, 1/2/2015, 1/4/2015, 1/5/2017, 1/6/2016, 1/6/2017, 1/9/2017, 2/4/2015"
                ]])
            );
        });

        it('Get concatenation of invoicesNo ordered by region and VALUE descending from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.group(ua.concat('row.invoiceNo + ": " + row.departmentRegion').over('').orderBy(['row.departmentRegion', 'DESC'])).by('row.departmentRegion'))
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([[
                    "1/9/2017: France, 1/2/2015: France, 1/6/2017: Germany, 1/6/2016: Germany, 1/4/2015: Germany, 2/4/2015: Poland, 1/5/2017: Poland, 1/12/2017: Poland, 1/11/2016: Poland, 1/10/2015: Poland",
                    "1/9/2017: France, 1/2/2015: France, 1/6/2017: Germany, 1/6/2016: Germany, 1/4/2015: Germany, 2/4/2015: Poland, 1/5/2017: Poland, 1/12/2017: Poland, 1/11/2016: Poland, 1/10/2015: Poland",
                    "1/9/2017: France, 1/2/2015: France, 1/6/2017: Germany, 1/6/2016: Germany, 1/4/2015: Germany, 2/4/2015: Poland, 1/5/2017: Poland, 1/12/2017: Poland, 1/11/2016: Poland, 1/10/2015: Poland"
                ]])
            );
        });
    });

    describe('MIN', () => {
        it('Get minimum invoice amount grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.min('row.invoiceAmount'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([16.65, 17.2, 0.2])
                );
        });

        it('Get minimum invoice amount over region grouped by region and department from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    department: 'row.department',
                    minAmount: 'row.departmentRegion + ": " + ' + ua.min('row.invoiceAmount').over('row.departmentRegion')
                })
                .from(testData.slice(0, 10))
                .groupBy([ 'row.departmentRegion', 'row.department' ])
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "department":"Sales - Y",
                        "minAmount":"Germany: 16.65"
                    },
                    {  
                        "department":"Sales - X",
                        "minAmount":"Germany: 16.65"
                    },
                    {  
                        "department":"Sales - Z",
                        "minAmount":"Poland: 17.2"
                    },
                    {  
                        "department":"Sales - X",
                        "minAmount":"Poland: 17.2"
                    },
                    {  
                        "department":"Sales - Y",
                        "minAmount":"France: 0.2"
                    },
                    {  
                        "department":"Sales - Z",
                        "minAmount":"France: 0.2"
                    }
                ])
            );
        });

        it('Get minimum amount of 7th invoice position from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.min('row.positions[6] ? row.positions[6].amount : null'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 2.275 ])
            );
        });
    });

    describe('MAX', () => {
        it('Get maximum invoice amount grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.max('row.invoiceAmount'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([94.975,376.59999999999997,52.725])
                );
        });

        it('Get maximum invoice amount over region grouped by region and department from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    department: 'row.department',
                    maxAmount: 'row.departmentRegion + ": " + ' + ua.max('row.invoiceAmount').over('row.departmentRegion')
                })
                .from(testData.slice(0, 10))
                .groupBy([ 'row.departmentRegion', 'row.department' ])
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "department":"Sales - Y",
                        "maxAmount":"Germany: 94.975"
                    },
                    {  
                        "department":"Sales - X",
                        "maxAmount":"Germany: 94.975"
                    },
                    {  
                        "department":"Sales - Z",
                        "maxAmount":"Poland: 376.59999999999997"
                    },
                    {  
                        "department":"Sales - X",
                        "maxAmount":"Poland: 376.59999999999997"
                    },
                    {  
                        "department":"Sales - Y",
                        "maxAmount":"France: 52.725"
                    },
                    {  
                        "department":"Sales - Z",
                        "maxAmount":"France: 52.725"
                    }
                ])
            );
        });

        it('Get maximum amount of 7th invoice position from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.max('row.positions[6] ? row.positions[6].amount : null'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 102.7 ])
            );
        });
    });

    describe('SUM', () => {
        it('Get sum of invoices amount grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.sum('row.invoiceAmount') + '.toFixed(2)')
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify(["181.15","953.10","52.93"])
            );
        });

        it('Get sum of invoices amount OVER region with region grouped by region, department from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    invoicesAmount: ua.sum('row.invoiceAmount').over('row.departmentRegion') + '.toFixed(2)'
                })
                .from(testData.slice(0, 10))
                .groupBy(['row.departmentRegion', 'row.department'])
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region":"Germany",
                        "invoicesAmount":"181.15"
                    },
                    {  
                        "region":"Germany",
                        "invoicesAmount":"181.15"
                    },
                    {  
                        "region":"Poland",
                        "invoicesAmount":"953.10"
                    },
                    {  
                        "region":"Poland",
                        "invoicesAmount":"953.10"
                    },
                    {  
                        "region":"France",
                        "invoicesAmount":"52.93"
                    },
                    {  
                        "region":"France",
                        "invoicesAmount":"52.93"
                    }
                ])
            );
        });

        it('Get sum of 7th position on each invoice from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.sum('row.positions[6] ? row.positions[6].amount : null'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 166.07500000000002 ])
                );
        });
    });

    describe('AVG', () => {
        it('Get avarage invoices amount grouped by region from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.avg('row.invoiceAmount'))
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([60.38333333333333,190.62,26.462500000000002])
                );
        });

        it('Get avarage invoices amount OVER region with region grouped by region and department from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.departmentRegion',
                    avarageAmount: ua.avg('row.invoiceAmount')
                })
                .from(testData.slice(0, 10))
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {  
                        "region":"Germany",
                        "avarageAmount":60.38333333333333
                    },
                    {  
                        "region":"Poland",
                        "avarageAmount":190.62
                    },
                    {  
                        "region":"France",
                        "avarageAmount":26.462500000000002
                    }
                ])
            );
        });

        it('Get avarage of 7th position on each invoice from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.avg('row.positions[6] ? row.positions[6].amount : null'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 41.518750000000004 ])
                );
        });
    });

    describe('COUNT', () => {
        it('Get count of invoices with at last 7 positions from first 10 rows', () => {
            var result = new ua.Query()
                .select(ua.count('row.positions[6]'))
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 4 ])
                );
        });

        it('Get count of invoices OVER region with department grouped by region and department from first 10 rows', () => {
            var result = new ua.Query()
                .select({
                    region: 'row.department',
                    invoicesCount: ua.count('ALL').over('row.departmentRegion')
                })
                .from(testData.slice(0, 10))
                .groupBy(['row.departmentRegion', 'row.department'])
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {  
                        "region":"Sales - Y",
                        "invoicesCount":3
                    },
                    {  
                        "region":"Sales - X",
                        "invoicesCount":3
                    },
                    {  
                        "region":"Sales - Z",
                        "invoicesCount":5
                    },
                    {  
                        "region":"Sales - X",
                        "invoicesCount":5
                    },
                    {  
                        "region":"Sales - Y",
                        "invoicesCount":2
                    },
                    {  
                        "region":"Sales - Z",
                        "invoicesCount":2
                    }
                ])
            );
        });
    });

    describe('Post processing', () => {

        it('CONCAT OVER, CONCAT, CONCAT(AVG)', () => {
            var result = new ua.Query()
                .select({
                    departmentsAvg: ua.concat(ua.avg('row.invoiceAmount') + '.toFixed(2)'),
                    invoices: ua.concat('row.invoiceNo').over('row.departmentRegion'),
                    departments: ua.concat('row.department')
                })
                .groupBy(['row.departmentRegion', 'row.department'])
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "departmentsAvg":"43.09, 43.09",
                        "invoices":"1/6/2016, 1/4/2015, 1/6/2017",
                        "departments":"Sales - Y, Sales - Y"
                    },
                    {  
                        "departmentsAvg":"94.97",
                        "invoices":"1/6/2016, 1/4/2015, 1/6/2017",
                        "departments":"Sales - X"
                    },
                    {  
                        "departmentsAvg":"227.40, 227.40, 227.40",
                        "invoices":"1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                        "departments":"Sales - Z, Sales - Z, Sales - Z"
                    },
                    {  
                        "departmentsAvg":"135.45, 135.45",
                        "invoices":"1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                        "departments":"Sales - X, Sales - X"
                    },
                    {  
                        "departmentsAvg":"0.20",
                        "invoices":"1/2/2015, 1/9/2017",
                        "departments":"Sales - Y"
                    },
                    {  
                        "departmentsAvg":"52.73",
                        "invoices":"1/2/2015, 1/9/2017",
                        "departments":"Sales - Z"
                    }
                ])
            );
        });

        it('CONCAT without query grouping + inner groups', () => {
            var result = new ua.Query()
                .select({
                    regions: ua.group({
                        invoicesByRegion: ua.concat('row.invoiceNo'),
                        invoicesByAccount: ua.group(ua.concat('row.invoiceNo').over('row.accountId')).by(['row.y','row.accountId'])
                    }).by('row.departmentRegion'),
                    invoices: ua.concat('row.invoiceNo + ": " + ' + ua.sum('row.invoiceAmount') + '.toFixed(2)').over('row.x'),
                    departments: ua.concat('row.department').orderBy('row.department'),
                    departmentsByRegions: ua.concat('row.department').over('row.departmentRegion').orderBy('row.department')
                })
                .groupBy()
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "regions": [
                            {
                                "invoicesByRegion": "1/6/2016, 1/4/2015, 1/6/2017",
                                "invoicesByAccount": [ "1/4/2015", "1/6/2016", "1/6/2017" ]
                            },
                            {
                                "invoicesByRegion": "1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015",
                                "invoicesByAccount": [ "1/5/2017", "2/4/2015", "1/12/2017, 1/10/2015", "1/11/2016" ]
                            },
                            {
                                "invoicesByRegion": "1/2/2015, 1/9/2017",
                                "invoicesByAccount": [ "1/9/2017", "1/2/2015" ]
                            }
                        ],
                        "invoices": "1/6/2016: 1187.17, 1/11/2016: 1187.17, 1/2/2015: 1187.17, 1/12/2017: 1187.17, 1/5/2017: 1187.17, 1/4/2015: 1187.17, 1/6/2017: 1187.17, 2/4/2015: 1187.17, 1/9/2017: 1187.17, 1/10/2015: 1187.17",
                        "departments": "Sales - X, Sales - X, Sales - X, Sales - Y, Sales - Y, Sales - Y, Sales - Z, Sales - Z, Sales - Z, Sales - Z",
                        "departmentsByRegions": "Sales - Y, Sales - Z"
                    }
                ])
            );
        });
    });
});