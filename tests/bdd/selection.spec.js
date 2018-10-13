var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test selection', () => {

    describe('To list', () => {
        
        it('Single value', () => {
            var result = ua.query()
                .select('row.invoiceAmount')
                .from(testData.slice(0, 1))
                .toList();

            assert.equal(typeof result[0], 'number');
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([69.525])
            );
        });

        it('Simple object', () => {
            var result = ua.query().select({
                invNumber: 'row.invoiceNo'
            }).from(testData.slice(0, 10)).toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { invNumber: "1/6/2016" },
                    { invNumber: "1/11/2016" },
                    { invNumber: "1/2/2015" },
                    { invNumber: "1/12/2017" },
                    { invNumber: "1/5/2017" },
                    { invNumber: "1/4/2015" },
                    { invNumber: "1/6/2017" },
                    { invNumber: "2/4/2015" },
                    { invNumber: "1/9/2017" },
                    { invNumber: "1/10/2015" }
                ])
            );
        });

        it('Object composition', () => {
            var result = ua.query().select({
                id: 'row.id',
                user: {
                    fullname: 'row.userName + " " + row.userSurname',
                    department: 'row.department'
                }
            }).from(testData.slice(0, 10)).toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "id": 1,
                        "user": {
                            "fullname": "Osama Inasyp",
                            "department": "Sales - Y"
                        }
                    },
                    {
                        "id": 2,
                        "user": {
                            "fullname": "Pan Nieznany",
                            "department": "Sales - Z"
                        }
                    },
                    {
                        "id": 3,
                        "user": {
                            "fullname": "Mr France 6",
                            "department": "Sales - Y"
                        }
                    },
                    {
                        "id": 4,
                        "user": {
                            "fullname": "Mr Ma100don't-a",
                            "department": "Sales - Z"
                        }
                    },
                    {
                        "id": 5,
                        "user": {
                            "fullname": "Dong King-Kong",
                            "department": "Sales - X"
                        }
                    },
                    {
                        "id": 6,
                        "user": {
                            "fullname": "Hasib Inasyp",
                            "department": "Sales - Y"
                        }
                    },
                    {
                        "id": 7,
                        "user": {
                            "fullname": "Mr Trugerman",
                            "department": "Sales - X"
                        }
                    },
                    {
                        "id": 8,
                        "user": {
                            "fullname": "Byłem Tu",
                            "department": "Sales - X"
                        }
                    },
                    {
                        "id": 9,
                        "user": {
                            "fullname": "Mr France 2",
                            "department": "Sales - Z"
                        }
                    },
                    {
                        "id": 10,
                        "user": {
                            "fullname": "Mr Ma100don't-a",
                            "department": "Sales - Z"
                        }
                    }
                ])
            );
        });

        it('Complex expressions', () => {
            var result = ua.query().select({
                invNumber: 'row.invoiceNo',
                amount: 'row.invoiceAmount.toFixed(2) + " " + row.currency',
                positionsAmount: 'row.positions.reduce((sum, pos) => sum + (pos.quantity * pos.amount), 0).toFixed(2)'
            }).from(testData.slice(0, 10)).toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { "invNumber": "1/6/2016", "amount": "69.53 EUR", "positionsAmount": "6664.88" },
                    { "invNumber": "1/11/2016", "amount": "376.60 PLN", "positionsAmount": "46095.40" },
                    { "invNumber": "1/2/2015", "amount": "0.20 EUR", "positionsAmount": "1.60" },
                    { "invNumber": "1/12/2017", "amount": "94.70 PLN", "positionsAmount": "13949.90" },
                    { "invNumber": "1/5/2017", "amount": "253.70 PLN", "positionsAmount": "34556.30" },
                    { "invNumber": "1/4/2015", "amount": "16.65 EUR", "positionsAmount": "1854.90" },
                    { "invNumber": "1/6/2017", "amount": "94.97 EUR", "positionsAmount": "14789.68" },
                    { "invNumber": "2/4/2015", "amount": "17.20 PLN", "positionsAmount": "2958.40" },
                    { "invNumber": "1/9/2017", "amount": "52.73 EUR", "positionsAmount": "4262.82" },
                    { "invNumber": "1/10/2015", "amount": "210.90 PLN", "positionsAmount": "17577.30" }
                ])
            );
        });

        it('Square brackets', () => {
            var result = ua.query().select({
                invNumber: 'row["invoiceNo"]',
                position: 'row.positions[0]["quantity"]'
            }).from(testData.slice(0, 10)).toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { "invNumber": "1/6/2016", "position": 73 },
                    { "invNumber": "1/11/2016", "position": 97 },
                    { "invNumber": "1/2/2015", "position": 8 },
                    { "invNumber": "1/12/2017", "position": 162 },
                    { "invNumber": "1/5/2017", "position": 121 },
                    { "invNumber": "1/4/2015", "position": 96 },
                    { "invNumber": "1/6/2017", "position": 84 },
                    { "invNumber": "2/4/2015", "position": 172 },
                    { "invNumber": "1/9/2017", "position": 52 },
                    { "invNumber": "1/10/2015", "position": 197 }
                ])
            );
        });

        it('Value within Array', () => {
            var result = ua.query()
                .select([ 'row["invoiceNo"]' ])
                .from(testData.slice(0, 10))
                .toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    [ "1/6/2016" ],
                    [ "1/11/2016" ],
                    [ "1/2/2015" ],
                    [ "1/12/2017" ],
                    [ "1/5/2017" ],
                    [ "1/4/2015" ],
                    [ "1/6/2017" ],
                    [ "2/4/2015" ],
                    [ "1/9/2017" ],
                    [ "1/10/2015" ]
                ])
            );
        });

        it('Object within Array', () => {
            var result = ua.query()
                .select([ { invoice: 'row["invoiceNo"]' } ])
                .from(testData.slice(0, 10))
                .toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    [{ "invoice": "1/6/2016" }],
                    [{ "invoice": "1/11/2016" }],
                    [{ "invoice": "1/2/2015" }],
                    [{ "invoice": "1/12/2017" }],
                    [{ "invoice": "1/5/2017" }],
                    [{ "invoice": "1/4/2015" }],
                    [{ "invoice": "1/6/2017" }],
                    [{ "invoice": "2/4/2015" }],
                    [{ "invoice": "1/9/2017" }],
                    [{ "invoice": "1/10/2015" }]
                ])
            );
        });

        it('Array within object composition', () => {
            var result = ua.query()
                .select({ invoice: [ 'row["invoiceNo"]' ] })
                .from(testData.slice(0, 10))
                .toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { "invoice": [ "1/6/2016" ] },
                    { "invoice": [ "1/11/2016" ] },
                    { "invoice": [ "1/2/2015" ] },
                    { "invoice": [ "1/12/2017" ] },
                    { "invoice": [ "1/5/2017" ] },
                    { "invoice": [ "1/4/2015" ] },
                    { "invoice": [ "1/6/2017" ] },
                    { "invoice": [ "2/4/2015" ] },
                    { "invoice": [ "1/9/2017" ] },
                    { "invoice": [ "1/10/2015" ] }
                ])
            );
        });

        it('Non aggregated data with sub selector', () => {
            var result = ua.query()
                .select({
                    regions: ua.group({
                        region: 'row.departmentRegion'
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
                            { "region": "Germany" },
                            { "region": "Poland" },
                            { "region": "France" }
                        ]
                    }
                ])
            );
        });

        it('Selection change', () => {
            var query = ua.query()
                .select({ invoice: [ 'row["invoiceNo"]' ] })
                .from(testData.slice(0, 10));
            
            assert.equal(
                JSON.stringify(query.toList()),
                JSON.stringify([
                    { "invoice": [ "1/6/2016" ] },
                    { "invoice": [ "1/11/2016" ] },
                    { "invoice": [ "1/2/2015" ] },
                    { "invoice": [ "1/12/2017" ] },
                    { "invoice": [ "1/5/2017" ] },
                    { "invoice": [ "1/4/2015" ] },
                    { "invoice": [ "1/6/2017" ] },
                    { "invoice": [ "2/4/2015" ] },
                    { "invoice": [ "1/9/2017" ] },
                    { "invoice": [ "1/10/2015" ] }
                ])
            );
            
            query.select({
                    regions: ua.group({
                        region: 'row.departmentRegion'
                    }).by('row.departmentRegion')
                })
                .groupBy('ALL')
                .from(testData.slice(0, 10));
            
            assert.equal(
                JSON.stringify(query.toList()),
                JSON.stringify([
                    {
                        "regions": [
                            { "region": "Germany" },
                            { "region": "Poland" },
                            { "region": "France" }
                        ]
                    }
                ])
            );
        })
    });

    describe('Handling errors', () => {

        it('Select with syntax error', () => {
            var results = ua.query({ logLevel: 0 })
                .select('row + xxx')
                .groupBy('ALL')
                .from(testData.slice(0, 10))
                .toList();
        
            assert.equal(
                JSON.stringify(results),
                JSON.stringify([])
            );
        });

        it('Select with unexpected token error', () => {
            var results = ua.query({ logLevel: 0 })
                .select('(row')
                .groupBy('ALL')
                .from(testData.slice(0, 10))
                .toList();
        
            assert.equal(
                JSON.stringify(results),
                JSON.stringify([])
            );
        });
    });
});