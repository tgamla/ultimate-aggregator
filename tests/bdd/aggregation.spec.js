var assert = require('assert');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

describe('Test aggregation', () => {

    describe('Without grouping', () => {

        it('First 19 rows with aggregated amount OVER departmentRegion', () => {
            var result = ua.query()
                .select({
                    region: 'row["departmentRegion"]',
                    amount: 'SUM(row.invoiceAmount) OVER (row.departmentRegion).toFixed(2) + " " + FIRST(row.currency) OVER (row.departmentRegion)'
                })
                .from(testData.slice(0, 19))
                .toList();
                
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                      "region": "Germany",
                      "amount": "383.98 EUR"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    },
                    {
                      "region": "Germany",
                      "amount": "383.98 EUR"
                    },
                    {
                      "region": "Germany",
                      "amount": "383.98 EUR"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "Germany",
                      "amount": "383.98 EUR"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "France",
                      "amount": "368.90 EUR"
                    },
                    {
                      "region": "Germany",
                      "amount": "383.98 EUR"
                    },
                    {
                      "region": "Poland",
                      "amount": "1608.70 PLN"
                    }
                  ])
            );
        });

        it('First 10 rows with aggregated amount OVER all', () => {
            var result = ua.query().select({
                    invoiceNo: 'row["invoiceNo"]',
                    amount: 'SUM(row.invoiceAmount) OVER ()'
                })
                .from(testData.slice(0, 9))
                .toList();
        
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                      "invoiceNo": "1/6/2016",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/11/2016",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/2/2015",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/12/2017",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/5/2017",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/4/2015",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/6/2017",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "2/4/2015",
                      "amount": 976.275
                    },
                    {
                      "invoiceNo": "1/9/2017",
                      "amount": 976.275
                    }
                  ])
            );
        });

        it('First 14 rows with aggregated max amount OVER seller per department region', () => {
            var result = ua.query()
                .select({
                    region: 'row.departmentRegion',
                    sellersAmount: 'row.userName + " " + row.userSurname + ": " + row.invoiceAmount',
                    maxSellersAmountPerRegion: 'MAX(SUM(row.invoiceAmount) OVER (row.accountId)) OVER (row.departmentRegion).toFixed(2)' // TODO:: add to OVER: row.departmentRegion, 
                })
                .from(testData.slice(0, 14))
                .toList();
                
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "region": "Germany",
                        "sellersAmount": "Osama Inasyp: 69.525",
                        "maxSellersAmountPerRegion": "169.48"
                    },
                    {  
                        "region": "Poland",
                        "sellersAmount": "Pan Nieznany: 376.59999999999997",
                        "maxSellersAmountPerRegion": "601.30"
                    },
                    {  
                        "region": "France",
                        "sellersAmount": "Mr France 6: 0.2",
                        "maxSellersAmountPerRegion": "125.72"
                    },
                    {  
                        "region": "Poland",
                        "sellersAmount": "Mr Ma100don't-a: 94.7",
                        "maxSellersAmountPerRegion": "601.30"
                    },
                    {  
                        "region": "Poland",
                        "sellersAmount": "Dong King-Kong: 253.7",
                        "maxSellersAmountPerRegion": "601.30"
                    },
                    {  
                        "region": "Germany",
                        "sellersAmount": "Hasib Inasyp: 16.65",
                        "maxSellersAmountPerRegion": "169.48"
                    },
                    {  
                        "region": "Germany",
                        "sellersAmount": "Mr Trugerman: 94.975",
                        "maxSellersAmountPerRegion": "169.48"
                    },
                    {  
                        "region": "Poland",
                        "sellersAmount": "Byłem Tu: 17.2",
                        "maxSellersAmountPerRegion": "601.30"
                    },
                    {  
                        "region": "France",
                        "sellersAmount": "Mr France 2: 52.725",
                        "maxSellersAmountPerRegion": "125.72"
                    },
                    {  
                        "region": "Poland",
                        "sellersAmount": "Mr Ma100don't-a: 210.9",
                        "maxSellersAmountPerRegion": "601.30"
                    },
                    {  
                        "region": "Poland",
                        "sellersAmount": "Dong King-Kong: 347.6",
                        "maxSellersAmountPerRegion": "601.30"
                    },
                    {  
                        "region": "France",
                        "sellersAmount": "Mr France 3: 72.325",
                        "maxSellersAmountPerRegion": "125.72"
                    },
                    {  
                        "region": "Germany",
                        "sellersAmount": "Osama Inasyp: 99.95",
                        "maxSellersAmountPerRegion": "169.48"
                    },
                    {  
                        "region": "France",
                        "sellersAmount": "Mr France 5: 125.725",
                        "maxSellersAmountPerRegion": "125.72"
                    }
                  ])
            );
        });

        it('Primal OVER aggregation + Inner non OVER aggregation', () => {
            var result = ua.query()
                .select('SUM(COUNT(row))OVER()')
                .from([1,2,3])
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([ 9, 9, 9 ])
            );
        });
    });

    describe('With grouping', () => {

        it('Aggregated ids of first 19 rows', () => {
            var result = ua.query()
              .select({
                sumOfIds: 'SUM(row.id)',
                highestId: 'MAX(row.id)'
              })
              .groupBy('Math.floor(row.id / 10)')
              .from(testData.slice(0, 19))
              .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    { sumOfIds: 45, highestId: 9 },
                    { sumOfIds: 145, highestId: 19 }
                ])
            );
        });

        it('Aggregated amount of sales per department regions with grouped amount of sales per each seller', () => {
            var result = ua.query()
                .select({
                    region: 'row.departmentRegion',
                    amount: 'SUM(row.invoiceAmount).toFixed(2) + " " + row.currency',
                    sellers: ua.group({
                        seller: 'row.userName + " " + row.userSurname',
                        amount: 'SUM(row.invoiceAmount).toFixed(2) + " " + row.currency'
                    })
                    .by(['row.userName', 'row.userSurname'])
                })
                .from(testData)
                .groupBy('row.departmentRegion')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "region": "Germany",
                        "amount": "10212.75 EUR",
                        "sellers": [
                            {
                                "seller": "Osama Inasyp",
                                "amount": "3798.70 EUR"
                            },
                            {
                                "seller": "Hasib Inasyp",
                                "amount": "3699.47 EUR"
                            },
                            {
                                "seller": "Mr Trugerman",
                                "amount": "2714.57 EUR"
                            }
                        ]
                    },
                    {
                        "region": "Poland",
                        "amount": "89377.50 PLN",
                        "sellers": [
                            {
                                "seller": "Pan Nieznany",
                                "amount": "15481.70 PLN"
                            },
                            {
                                "seller": "Mr Ma100don't-a",
                                "amount": "13609.60 PLN"
                            },
                            {
                                "seller": "Mr Siabadaba",
                                "amount": "7719.60 PLN"
                            },
                            {
                                "seller": "Dong King-Kong",
                                "amount": "13095.40 PLN"
                            },
                            {
                                "seller": "Byłem Tu",
                                "amount": "10330.80 PLN"
                            },
                            {
                                "seller": "Nowy Kowalski",
                                "amount": "11398.70 PLN"
                            },
                            {
                                "seller": "Aba Ukulele",
                                "amount": "7979.00 PLN"
                            },
                            {
                                "seller": "Tomasz Gamla",
                                "amount": "9762.70 PLN"
                            }
                        ]
                    },
                    {
                        "region": "France",
                        "amount": "16576.42 EUR",
                        "sellers": [
                            {
                                "seller": "Mr France 6",
                                "amount": "2643.95 EUR"
                            },
                            {
                                "seller": "Mr France 2",
                                "amount": "2625.20 EUR"
                            },
                            {
                                "seller": "Mr France 3",
                                "amount": "2902.35 EUR"
                            },
                            {
                                "seller": "Mr France 5",
                                "amount": "2689.18 EUR"
                            },
                            {
                                "seller": "Mr France 4",
                                "amount": "2590.05 EUR"
                            },
                            {
                                "seller": "Mr France 1",
                                "amount": "3125.70 EUR"
                            }
                        ]
                    }
                ])
            );
        });

        it('Aggregated 50 first rows by regions with ungrouped invoices sumed and concatenated over seller', () => {
          var result = ua.query()
              .select({
                region: 'row.departmentRegion',
                regionFirst: 'FIRST(row.departmentRegion)',
                invoices: ua.ungroup({
                    seller: 'row.userName + " " + row.userSurname',
                    amount: 'row.invoiceAmount',
                    invoiceNo: 'row.invoiceNo',
                    total: 'SUM(row.invoiceAmount) OVER (row.accountId)',
                    invoices: 'CONCAT(row.invoiceNo) OVER (row.accountId)'
                })
              })
              .from(testData.slice(0, 50))
              .groupBy('row.departmentRegion')
              .toList();
      
          assert.equal(
            JSON.stringify(result),
            JSON.stringify([  
              {  
                 "region":"Germany",
                 "regionFirst":"Germany",
                 "invoices":[  
                    {  
                       "seller":"Osama Inasyp",
                       "amount":69.525,
                       "invoiceNo":"1/6/2016",
                       "total":415.7750000000001,
                       "invoices":"1/6/2016, 1/2/2017, 2/10/2017, 3/4/2015, 4/12/2017"
                    },
                    {  
                       "seller":"Hasib Inasyp",
                       "amount":16.65,
                       "invoiceNo":"1/4/2015",
                       "total":155.175,
                       "invoices":"1/4/2015, 1/10/2017, 2/1/2017"
                    },
                    {  
                       "seller":"Mr Trugerman",
                       "amount":94.975,
                       "invoiceNo":"1/6/2017",
                       "total":94.975,
                       "invoices":"1/6/2017"
                    },
                    {  
                       "seller":"Osama Inasyp",
                       "amount":99.95,
                       "invoiceNo":"1/2/2017",
                       "total":415.7750000000001,
                       "invoices":"1/6/2016, 1/2/2017, 2/10/2017, 3/4/2015, 4/12/2017"
                    },
                    {  
                       "seller":"Hasib Inasyp",
                       "amount":102.875,
                       "invoiceNo":"1/10/2017",
                       "total":155.175,
                       "invoices":"1/4/2015, 1/10/2017, 2/1/2017"
                    },
                    {  
                       "seller":"Osama Inasyp",
                       "amount":103.6,
                       "invoiceNo":"2/10/2017",
                       "total":415.7750000000001,
                       "invoices":"1/6/2016, 1/2/2017, 2/10/2017, 3/4/2015, 4/12/2017"
                    },
                    {  
                       "seller":"Hasib Inasyp",
                       "amount":35.65,
                       "invoiceNo":"2/1/2017",
                       "total":155.175,
                       "invoices":"1/4/2015, 1/10/2017, 2/1/2017"
                    },
                    {  
                       "seller":"Osama Inasyp",
                       "amount":108.22500000000001,
                       "invoiceNo":"3/4/2015",
                       "total":415.7750000000001,
                       "invoices":"1/6/2016, 1/2/2017, 2/10/2017, 3/4/2015, 4/12/2017"
                    },
                    {  
                       "seller":"Osama Inasyp",
                       "amount":34.474999999999994,
                       "invoiceNo":"4/12/2017",
                       "total":415.7750000000001,
                       "invoices":"1/6/2016, 1/2/2017, 2/10/2017, 3/4/2015, 4/12/2017"
                    }
                 ]
              },
              {  
                 "region":"Poland",
                 "regionFirst":"Poland",
                 "invoices":[  
                    {  
                       "seller":"Pan Nieznany",
                       "amount":376.59999999999997,
                       "invoiceNo":"1/11/2016",
                       "total":684.5999999999999,
                       "invoices":"1/11/2016, 1/3/2016"
                    },
                    {  
                       "seller":"Mr Ma100don't-a",
                       "amount":94.7,
                       "invoiceNo":"1/12/2017",
                       "total":305.6,
                       "invoices":"1/12/2017, 1/10/2015"
                    },
                    {  
                       "seller":"Dong King-Kong",
                       "amount":253.7,
                       "invoiceNo":"1/5/2017",
                       "total":1177.6,
                       "invoices":"1/5/2017, 1/8/2017, 1/6/2015, 3/3/2015"
                    },
                    {  
                       "seller":"Byłem Tu",
                       "amount":17.2,
                       "invoiceNo":"2/4/2015",
                       "total":89.9,
                       "invoices":"2/4/2015, 2/11/2016, 1/7/2016"
                    },
                    {  
                       "seller":"Mr Ma100don't-a",
                       "amount":210.9,
                       "invoiceNo":"1/10/2015",
                       "total":305.6,
                       "invoices":"1/12/2017, 1/10/2015"
                    },
                    {  
                       "seller":"Dong King-Kong",
                       "amount":347.6,
                       "invoiceNo":"1/8/2017",
                       "total":1177.6,
                       "invoices":"1/5/2017, 1/8/2017, 1/6/2015, 3/3/2015"
                    },
                    {  
                       "seller":"Pan Nieznany",
                       "amount":308,
                       "invoiceNo":"1/3/2016",
                       "total":684.5999999999999,
                       "invoices":"1/11/2016, 1/3/2016"
                    },
                    {  
                       "seller":"Mr Siabadaba",
                       "amount":252.20000000000002,
                       "invoiceNo":"2/5/2017",
                       "total":262.40000000000003,
                       "invoices":"2/5/2017, 2/9/2016"
                    },
                    {  
                       "seller":"Nowy Kowalski",
                       "amount":211.1,
                       "invoiceNo":"2/10/2015",
                       "total":814.4,
                       "invoices":"2/10/2015, 2/2/2015, 1/11/2015, 2/4/2016, 3/6/2017"
                    },
                    {  
                       "seller":"Byłem Tu",
                       "amount":4.2,
                       "invoiceNo":"2/11/2016",
                       "total":89.9,
                       "invoices":"2/4/2015, 2/11/2016, 1/7/2016"
                    },
                    {  
                       "seller":"Byłem Tu",
                       "amount":68.5,
                       "invoiceNo":"1/7/2016",
                       "total":89.9,
                       "invoices":"2/4/2015, 2/11/2016, 1/7/2016"
                    },
                    {  
                       "seller":"Nowy Kowalski",
                       "amount":151.8,
                       "invoiceNo":"2/2/2015",
                       "total":814.4,
                       "invoices":"2/10/2015, 2/2/2015, 1/11/2015, 2/4/2016, 3/6/2017"
                    },
                    {  
                       "seller":"Nowy Kowalski",
                       "amount":50,
                       "invoiceNo":"1/11/2015",
                       "total":814.4,
                       "invoices":"2/10/2015, 2/2/2015, 1/11/2015, 2/4/2016, 3/6/2017"
                    },
                    {  
                       "seller":"Aba Ukulele",
                       "amount":184.6,
                       "invoiceNo":"2/6/2017",
                       "total":184.6,
                       "invoices":"2/6/2017"
                    },
                    {  
                       "seller":"Nowy Kowalski",
                       "amount":93.3,
                       "invoiceNo":"2/4/2016",
                       "total":814.4,
                       "invoices":"2/10/2015, 2/2/2015, 1/11/2015, 2/4/2016, 3/6/2017"
                    },
                    {  
                       "seller":"Mr Siabadaba",
                       "amount":10.200000000000001,
                       "invoiceNo":"2/9/2016",
                       "total":262.40000000000003,
                       "invoices":"2/5/2017, 2/9/2016"
                    },
                    {  
                       "seller":"Nowy Kowalski",
                       "amount":308.2,
                       "invoiceNo":"3/6/2017",
                       "total":814.4,
                       "invoices":"2/10/2015, 2/2/2015, 1/11/2015, 2/4/2016, 3/6/2017"
                    },
                    {  
                       "seller":"Dong King-Kong",
                       "amount":417.3,
                       "invoiceNo":"1/6/2015",
                       "total":1177.6,
                       "invoices":"1/5/2017, 1/8/2017, 1/6/2015, 3/3/2015"
                    },
                    {  
                       "seller":"Dong King-Kong",
                       "amount":159,
                       "invoiceNo":"3/3/2015",
                       "total":1177.6,
                       "invoices":"1/5/2017, 1/8/2017, 1/6/2015, 3/3/2015"
                    }
                 ]
              },
              {  
                 "region":"France",
                 "regionFirst":"France",
                 "invoices":[  
                    {  
                       "seller":"Mr France 6",
                       "amount":0.2,
                       "invoiceNo":"1/2/2015",
                       "total":188.17499999999998,
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 2/3/2015"
                    },
                    {  
                       "seller":"Mr France 2",
                       "amount":52.725,
                       "invoiceNo":"1/9/2017",
                       "total":127.87500000000001,
                       "invoices":"1/9/2017, 1/8/2015, 3/11/2016"
                    },
                    {  
                       "seller":"Mr France 3",
                       "amount":72.325,
                       "invoiceNo":"1/5/2016",
                       "total":258.15,
                       "invoices":"1/5/2016, 2/8/2017, 3/12/2017, 1/12/2016, 3/8/2017, 2/6/2016"
                    },
                    {  
                       "seller":"Mr France 5",
                       "amount":125.725,
                       "invoiceNo":"2/12/2017",
                       "total":282.17499999999995,
                       "invoices":"2/12/2017, 1/7/2015, 1/11/2017, 3/10/2015"
                    },
                    {  
                       "seller":"Mr France 4",
                       "amount":56.35,
                       "invoiceNo":"1/3/2015",
                       "total":60.7,
                       "invoices":"1/3/2015, 2/11/2017"
                    },
                    {  
                       "seller":"Mr France 3",
                       "amount":3.575,
                       "invoiceNo":"2/8/2017",
                       "total":258.15,
                       "invoices":"1/5/2016, 2/8/2017, 3/12/2017, 1/12/2016, 3/8/2017, 2/6/2016"
                    },
                    {  
                       "seller":"Mr France 6",
                       "amount":58,
                       "invoiceNo":"1/9/2016",
                       "total":188.17499999999998,
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 2/3/2015"
                    },
                    {  
                       "seller":"Mr France 6",
                       "amount":68.85,
                       "invoiceNo":"1/3/2017",
                       "total":188.17499999999998,
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 2/3/2015"
                    },
                    {  
                       "seller":"Mr France 6",
                       "amount":19.4,
                       "invoiceNo":"1/1/2017",
                       "total":188.17499999999998,
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 2/3/2015"
                    },
                    {  
                       "seller":"Mr France 6",
                       "amount":13.95,
                       "invoiceNo":"1/5/2015",
                       "total":188.17499999999998,
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 2/3/2015"
                    },
                    {  
                       "seller":"Mr France 2",
                       "amount":49.825,
                       "invoiceNo":"1/8/2015",
                       "total":127.87500000000001,
                       "invoices":"1/9/2017, 1/8/2015, 3/11/2016"
                    },
                    {  
                       "seller":"Mr France 5",
                       "amount":14.3,
                       "invoiceNo":"1/7/2015",
                       "total":282.17499999999995,
                       "invoices":"2/12/2017, 1/7/2015, 1/11/2017, 3/10/2015"
                    },
                    {  
                       "seller":"Mr France 3",
                       "amount":2.5,
                       "invoiceNo":"3/12/2017",
                       "total":258.15,
                       "invoices":"1/5/2016, 2/8/2017, 3/12/2017, 1/12/2016, 3/8/2017, 2/6/2016"
                    },
                    {  
                       "seller":"Mr France 2",
                       "amount":25.325,
                       "invoiceNo":"3/11/2016",
                       "total":127.87500000000001,
                       "invoices":"1/9/2017, 1/8/2015, 3/11/2016"
                    },
                    {  
                       "seller":"Mr France 5",
                       "amount":24.549999999999997,
                       "invoiceNo":"1/11/2017",
                       "total":282.17499999999995,
                       "invoices":"2/12/2017, 1/7/2015, 1/11/2017, 3/10/2015"
                    },
                    {  
                       "seller":"Mr France 1",
                       "amount":13.625,
                       "invoiceNo":"1/4/2016",
                       "total":13.625,
                       "invoices":"1/4/2016"
                    },
                    {  
                       "seller":"Mr France 5",
                       "amount":117.6,
                       "invoiceNo":"3/10/2015",
                       "total":282.17499999999995,
                       "invoices":"2/12/2017, 1/7/2015, 1/11/2017, 3/10/2015"
                    },
                    {  
                       "seller":"Mr France 6",
                       "amount":27.775,
                       "invoiceNo":"2/3/2015",
                       "total":188.17499999999998,
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 2/3/2015"
                    },
                    {  
                       "seller":"Mr France 3",
                       "amount":104.32499999999999,
                       "invoiceNo":"1/12/2016",
                       "total":258.15,
                       "invoices":"1/5/2016, 2/8/2017, 3/12/2017, 1/12/2016, 3/8/2017, 2/6/2016"
                    },
                    {  
                       "seller":"Mr France 3",
                       "amount":50.175,
                       "invoiceNo":"3/8/2017",
                       "total":258.15,
                       "invoices":"1/5/2016, 2/8/2017, 3/12/2017, 1/12/2016, 3/8/2017, 2/6/2016"
                    },
                    {  
                       "seller":"Mr France 4",
                       "amount":4.3500000000000005,
                       "invoiceNo":"2/11/2017",
                       "total":60.7,
                       "invoices":"1/3/2015, 2/11/2017"
                    },
                    {  
                       "seller":"Mr France 3",
                       "amount":25.25,
                       "invoiceNo":"2/6/2016",
                       "total":258.15,
                       "invoices":"1/5/2016, 2/8/2017, 3/12/2017, 1/12/2016, 3/8/2017, 2/6/2016"
                    }
                 ]
              }
           ])
          );
        });

        it('Aggregated amount of sales per regions, departments, sellers as groups respectively', () => {
            var result = ua.query()
                .select({
                    region: 'row["departmentRegion"]',
                    amount: 'SUM(row.invoiceAmount).toFixed(2) + " " + row.currency',
                    departments: ua.group({
                        department: 'row.department',
                        amount: 'SUM(row.invoiceAmount).toFixed(2) + " " + row.currency',
                        sellers: ua.group({
                            seller: 'row.userName + " " + row.userSurname',
                            department: 'row["department"]',
                            amount: '(SUM(row.invoiceAmount)).toFixed(2) + " " + row.currency'
                        }).by(['row.userName', 'row.userSurname'])
                    }).by('row["department"]')
                })
                .from(testData)
                .groupBy('row["departmentRegion"]')
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                    "region": "Germany",
                    "amount": "10212.75 EUR",
                    "departments": [
                        {
                        "department": "Sales - Y",
                        "amount": "7498.18 EUR",
                        "sellers": [
                            {
                            "seller": "Osama Inasyp",
                            "department": "Sales - Y",
                            "amount": "3798.70 EUR"
                            },
                            {
                            "seller": "Hasib Inasyp",
                            "department": "Sales - Y",
                            "amount": "3699.47 EUR"
                            }
                        ]
                        },
                        {
                        "department": "Sales - X",
                        "amount": "2714.57 EUR",
                        "sellers": [
                            {
                            "seller": "Mr Trugerman",
                            "department": "Sales - X",
                            "amount": "2714.57 EUR"
                            }
                        ]
                        }
                    ]
                    },
                    {
                    "region": "Poland",
                    "amount": "89377.50 PLN",
                    "departments": [
                        {
                        "department": "Sales - Z",
                        "amount": "29091.30 PLN",
                        "sellers": [
                            {
                            "seller": "Pan Nieznany",
                            "department": "Sales - Z",
                            "amount": "15481.70 PLN"
                            },
                            {
                            "seller": "Mr Ma100don't-a",
                            "department": "Sales - Z",
                            "amount": "13609.60 PLN"
                            }
                        ]
                        },
                        {
                        "department": "Sales - X",
                        "amount": "33188.90 PLN",
                        "sellers": [
                            {
                            "seller": "Dong King-Kong",
                            "department": "Sales - X",
                            "amount": "13095.40 PLN"
                            },
                            {
                            "seller": "Byłem Tu",
                            "department": "Sales - X",
                            "amount": "10330.80 PLN"
                            },
                            {
                            "seller": "Tomasz Gamla",
                            "department": "Sales - X",
                            "amount": "9762.70 PLN"
                            }
                        ]
                        },
                        {
                        "department": "Sales - Y",
                        "amount": "27097.30 PLN",
                        "sellers": [
                            {
                            "seller": "Mr Siabadaba",
                            "department": "Sales - Y",
                            "amount": "7719.60 PLN"
                            },
                            {
                            "seller": "Nowy Kowalski",
                            "department": "Sales - Y",
                            "amount": "11398.70 PLN"
                            },
                            {
                            "seller": "Aba Ukulele",
                            "department": "Sales - Y",
                            "amount": "7979.00 PLN"
                            }
                        ]
                        }
                    ]
                    },
                    {
                    "region": "France",
                    "amount": "16576.42 EUR",
                    "departments": [
                        {
                        "department": "Sales - Y",
                        "amount": "5769.65 EUR",
                        "sellers": [
                            {
                            "seller": "Mr France 6",
                            "department": "Sales - Y",
                            "amount": "2643.95 EUR"
                            },
                            {
                            "seller": "Mr France 1",
                            "department": "Sales - Y",
                            "amount": "3125.70 EUR"
                            }
                        ]
                        },
                        {
                        "department": "Sales - Z",
                        "amount": "10806.77 EUR",
                        "sellers": [
                            {
                            "seller": "Mr France 2",
                            "department": "Sales - Z",
                            "amount": "2625.20 EUR"
                            },
                            {
                            "seller": "Mr France 3",
                            "department": "Sales - Z",
                            "amount": "2902.35 EUR"
                            },
                            {
                            "seller": "Mr France 5",
                            "department": "Sales - Z",
                            "amount": "2689.18 EUR"
                            },
                            {
                            "seller": "Mr France 4",
                            "department": "Sales - Z",
                            "amount": "2590.05 EUR"
                            }
                        ]
                        }
                    ]
                    }
                ])
            );
        });

        it('Aggregate first 19 invoices amount per region, sub-grouped without any aggrgeation per department, ungrouped invoices', () => {
            var result = ua.query().select({
                departmentRegion: 'row.departmentRegion',
                amount: 'SUM(row.invoiceAmount).toFixed(2) + " " + row.currency',
                departments: ua.group({
                    department: 'row.department',
                    invoices: ua.ungroup({
                        department: 'row.invoiceNo',
                        amount: '(row.invoiceAmount).toFixed(2) + " " + row.currency'
                    })
                }).by('row["department"]')
            }).groupBy('row.departmentRegion').from(testData.slice(0, 19)).toList();
        
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                      "departmentRegion": "Germany",
                      "amount": "383.98 EUR",
                      "departments": [
                        {
                          "department": "Sales - Y",
                          "invoices": [
                            {
                              "department": "1/6/2016",
                              "amount": "69.53 EUR"
                            },
                            {
                              "department": "1/4/2015",
                              "amount": "16.65 EUR"
                            },
                            {
                              "department": "1/2/2017",
                              "amount": "99.95 EUR"
                            },
                            {
                              "department": "1/10/2017",
                              "amount": "102.88 EUR"
                            }
                          ]
                        },
                        {
                          "department": "Sales - X",
                          "invoices": [
                            {
                              "department": "1/6/2017",
                              "amount": "94.97 EUR"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "departmentRegion": "Poland",
                      "amount": "1608.70 PLN",
                      "departments": [
                        {
                          "department": "Sales - Z",
                          "invoices": [
                            {
                              "department": "1/11/2016",
                              "amount": "376.60 PLN"
                            },
                            {
                              "department": "1/12/2017",
                              "amount": "94.70 PLN"
                            },
                            {
                              "department": "1/10/2015",
                              "amount": "210.90 PLN"
                            },
                            {
                              "department": "1/3/2016",
                              "amount": "308.00 PLN"
                            }
                          ]
                        },
                        {
                          "department": "Sales - X",
                          "invoices": [
                            {
                              "department": "1/5/2017",
                              "amount": "253.70 PLN"
                            },
                            {
                              "department": "2/4/2015",
                              "amount": "17.20 PLN"
                            },
                            {
                              "department": "1/8/2017",
                              "amount": "347.60 PLN"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "departmentRegion": "France",
                      "amount": "368.90 EUR",
                      "departments": [
                        {
                          "department": "Sales - Y",
                          "invoices": [
                            {
                              "department": "1/2/2015",
                              "amount": "0.20 EUR"
                            },
                            {
                              "department": "1/9/2016",
                              "amount": "58.00 EUR"
                            }
                          ]
                        },
                        {
                          "department": "Sales - Z",
                          "invoices": [
                            {
                              "department": "1/9/2017",
                              "amount": "52.73 EUR"
                            },
                            {
                              "department": "1/5/2016",
                              "amount": "72.33 EUR"
                            },
                            {
                              "department": "2/12/2017",
                              "amount": "125.72 EUR"
                            },
                            {
                              "department": "1/3/2015",
                              "amount": "56.35 EUR"
                            },
                            {
                              "department": "2/8/2017",
                              "amount": "3.58 EUR"
                            }
                          ]
                        }
                      ]
                    }
                  ])
            );
        });

        it('Concatenate each invoice amount percentage over total amount per department grouped by region using inner aggregation from first 50 rows', () => {
            var result = ua.query()
                .select({
                    departmentRegion: 'row.departmentRegion',
                    departments: ua.group({
                        department: 'row.department',
                        avarageAmount: 'CONCAT(((row.invoiceAmount / SUM(row.invoiceAmount) OVER (row.accountId)) * 100).toFixed(1) + "%")'
                    }).by('row["department"]')
                }).groupBy('row.departmentRegion').from(testData.slice(0, 50)).toList();
        
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                  {  
                     "departmentRegion":"Germany",
                     "departments":[  
                        {  
                           "department":"Sales - Y",
                           "avarageAmount":"16.7%, 10.7%, 24.0%, 66.3%, 24.9%, 23.0%, 26.0%, 8.3%"
                        },
                        {  
                           "department":"Sales - X",
                           "avarageAmount":"100.0%"
                        }
                     ]
                  },
                  {  
                     "departmentRegion":"Poland",
                     "departments":[  
                        {  
                           "department":"Sales - Z",
                           "avarageAmount":"55.0%, 31.0%, 69.0%, 45.0%"
                        },
                        {  
                           "department":"Sales - X",
                           "avarageAmount":"21.5%, 19.1%, 29.5%, 4.7%, 76.2%, 35.4%, 13.5%"
                        },
                        {  
                           "department":"Sales - Y",
                           "avarageAmount":"96.1%, 25.9%, 18.6%, 6.1%, 100.0%, 11.5%, 3.9%, 37.8%"
                        }
                     ]
                  },
                  {  
                     "departmentRegion":"France",
                     "departments":[  
                        {  
                           "department":"Sales - Y",
                           "avarageAmount":"0.1%, 30.8%, 36.6%, 10.3%, 7.4%, 100.0%, 14.8%"
                        },
                        {  
                           "department":"Sales - Z",
                           "avarageAmount":"41.2%, 28.0%, 44.6%, 92.8%, 1.4%, 39.0%, 5.1%, 1.0%, 19.8%, 8.7%, 41.7%, 40.4%, 19.4%, 7.2%, 9.8%"
                        }
                     ]
                  }
               ])
            );
        });

        it('Percentage amount per department over departmentRegion', () => {
            var result = ua.query()
                .select({
                    departmentRegion: 'row.departmentRegion',
                    departments: ua.group({
                        department: 'row.department',
                        avarageAmount: '((SUM(row.invoiceAmount) / SUM(row.invoiceAmount) OVER (row.departmentRegion)) * 100).toFixed(1) + "%"'
                    }).by('row["department"]')
                })
                .groupBy('row.departmentRegion')
                .from(testData)
                .toList();
        
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                  {  
                     "departmentRegion":"Germany",
                     "departments":[  
                        {  
                           "department":"Sales - Y",
                           "avarageAmount":"73.4%"
                        },
                        {  
                           "department":"Sales - X",
                           "avarageAmount":"26.6%"
                        }
                     ]
                  },
                  {  
                     "departmentRegion":"Poland",
                     "departments":[  
                        {  
                           "department":"Sales - Z",
                           "avarageAmount":"32.5%"
                        },
                        {  
                           "department":"Sales - X",
                           "avarageAmount":"37.1%"
                        },
                        {  
                           "department":"Sales - Y",
                           "avarageAmount":"30.3%"
                        }
                     ]
                  },
                  {  
                     "departmentRegion":"France",
                     "departments":[  
                        {  
                           "department":"Sales - Y",
                           "avarageAmount":"34.8%"
                        },
                        {  
                           "department":"Sales - Z",
                           "avarageAmount":"65.2%"
                        }
                     ]
                  }
               ])
            );
        });

        it('Sum of inovices amount by department region, department, user name, user surname in 3 dimentional Array as output', () => {
            var result = ua.query()
              .select(
                  ua.group(
                      ua.group(
                          'SUM(row.invoiceAmount)'
                      ).by(['row.userName', 'row.userSurname'])
                  ).by('row.department')
              )
              .groupBy('row.departmentRegion')
              .from(testData)
              .toList();
        
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    [
                      [
                        3798.7,
                        3699.475
                      ],
                      [
                        2714.574999999999
                      ]
                    ],
                    [
                      [
                        15481.7,
                        13609.6
                      ],
                      [
                        13095.400000000003,
                        10330.800000000003,
                        9762.699999999999
                      ],
                      [
                        7719.6,
                        11398.7,
                        7979
                      ]
                    ],
                    [
                      [
                        2643.9499999999994,
                        3125.7
                      ],
                      [
                        2625.2,
                        2902.3500000000004,
                        2689.1750000000006,
                        2590.05
                      ]
                    ]
                  ])
            );
        });

        it('Amount of all invoices', () => {
            var result = ua.query()
            .select('SUM(row.invoiceAmount)')
            .from(testData)
            .toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([116166.67499999987])
            );
        });

        it('Square amount of first 19 invoices', () => {
            var result = ua.query()
                .select('SUM(SUM(row.invoiceAmount)).toFixed(2)')
                .from(testData.slice(0, 19))
                .toList();
            
            assert.equal(
                JSON.stringify(result),
                JSON.stringify(["44869.92"])
            );
        });

        it('first 9 rows with aggregated amount OVER all by "true" value', () => {
            var result = ua.query()
                .select({
                    region: 'row.departmentRegion',
                    amount: 'SUM(row.invoiceAmount) OVER (true)'
                })
                .groupBy('row.departmentRegion')
                .from(testData.slice(0, 9))
                .toList();
        
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                  { "region": "Germany", "amount": 976.275 },
                  { "region": "Poland", "amount": 976.275 },
                  { "region": "France", "amount": 976.275 }
                ])
            );
        });

        it('first 9 rows with aggregated amount OVER all by "true, *, ALL" value', () => {
          var result = ua.query()
              .select({
                  region: 'row.departmentRegion',
                  amount: 'SUM(row.invoiceAmount) OVER (true, *, ALL)'
              })
              .groupBy('row.departmentRegion')
              .from(testData.slice(0, 9))
              .toList();
      
          assert.equal(
              JSON.stringify(result),
              JSON.stringify([
                { "region": "Germany", "amount": 976.275 },
                { "region": "Poland", "amount": 976.275 },
                { "region": "France", "amount": 976.275 }
              ])
          );
        });

        it('Aggegate sum of first 10 invoices with non grouped region using OVER without arguments', () => {
        
            var result = new ua.Query()
                .select({
                    region: 'row["departmentRegion"]',
                    amount: 'SUM(row.invoiceAmount) OVER ()'
                })
                .from(testData.slice(0, 10))
                .toList();

            assert.equal(
              JSON.stringify(result),
              JSON.stringify([
                { "region": "Germany", "amount": 1187.175 },
                { "region": "Poland", "amount": 1187.175 },
                { "region": "France", "amount": 1187.175 },
                { "region": "Poland", "amount": 1187.175 },
                { "region": "Poland", "amount": 1187.175 },
                { "region": "Germany", "amount": 1187.175 },
                { "region": "Germany", "amount": 1187.175 },
                { "region": "Poland", "amount": 1187.175 },
                { "region": "France", "amount": 1187.175 },
                { "region": "Poland", "amount": 1187.175 }
              ])
            );
        });

        it('Count first 10 invoices grouped with "true" argument', () => {
        
            var result = new ua.Query()
                .select('COUNT(true)')
                .from(testData.slice(0, 10))
                .groupBy('true')
                .toList();

            assert.equal(result[0], 10);
        });

        it('Count first 10 invoices grouped with "*" argument', () => {
        
            var result = new ua.Query()
                .select('COUNT(true)')
                .from(testData.slice(0, 10))
                .groupBy(['*'])
                .toList();

            assert.equal(result[0], 10);
        });

        it('Count first 10 invoices grouped with "ALL" argument', () => {
        
            var result = new ua.Query()
                .select('COUNT(true)')
                .from(testData.slice(0, 10))
                .groupBy('ALL')
                .toList();

            assert.equal(result[0], 10);
        });

        it('Count first 10 invoices grouped with true argument', () => {
        
          var result = new ua.Query()
              .select('COUNT(true)')
              .from(testData.slice(0, 10))
              .groupBy(true)
              .toList();

          assert.equal(result[0], 10);
        });

        it('Select regions grouped by region, as subselector concatenate all invoices per department, as subselector ungroup and select seller with amount sum of all sellers invoices from first 100 rows', () => {
          var result = ua.query()
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

          assert.equal(
            JSON.stringify(result),
            JSON.stringify([  
              {  
                 "region":"Germany",
                 "regionFirst":"Germany",
                 "departments":[  
                    {  
                       "department":"Sales - Y",
                       "invoices":"1/6/2016, 1/4/2015, 1/2/2017, 1/10/2017, 2/10/2017, 2/1/2017, 3/4/2015, 4/12/2017",
                       "sellerInvoices":[  
                          {  
                             "seller":"Osama Inasyp",
                             "amount":69.525,
                             "invoiceNo":"1/6/2016",
                             "total":415.7750000000001
                          },
                          {  
                             "seller":"Hasib Inasyp",
                             "amount":16.65,
                             "invoiceNo":"1/4/2015",
                             "total":155.175
                          },
                          {  
                             "seller":"Osama Inasyp",
                             "amount":99.95,
                             "invoiceNo":"1/2/2017",
                             "total":415.7750000000001
                          },
                          {  
                             "seller":"Hasib Inasyp",
                             "amount":102.875,
                             "invoiceNo":"1/10/2017",
                             "total":155.175
                          },
                          {  
                             "seller":"Osama Inasyp",
                             "amount":103.6,
                             "invoiceNo":"2/10/2017",
                             "total":415.7750000000001
                          },
                          {  
                             "seller":"Hasib Inasyp",
                             "amount":35.65,
                             "invoiceNo":"2/1/2017",
                             "total":155.175
                          },
                          {  
                             "seller":"Osama Inasyp",
                             "amount":108.22500000000001,
                             "invoiceNo":"3/4/2015",
                             "total":415.7750000000001
                          },
                          {  
                             "seller":"Osama Inasyp",
                             "amount":34.474999999999994,
                             "invoiceNo":"4/12/2017",
                             "total":415.7750000000001
                          }
                       ]
                    },
                    {  
                       "department":"Sales - X",
                       "invoices":"1/6/2017",
                       "sellerInvoices":[  
                          {  
                             "seller":"Mr Trugerman",
                             "amount":94.975,
                             "invoiceNo":"1/6/2017",
                             "total":94.975
                          }
                       ]
                    }
                 ]
              },
              {  
                 "region":"Poland",
                 "regionFirst":"Poland",
                 "departments":[  
                    {  
                       "department":"Sales - Z",
                       "invoices":"1/11/2016, 1/12/2017, 1/10/2015, 1/3/2016",
                       "sellerInvoices":[  
                          {  
                             "seller":"Pan Nieznany",
                             "amount":376.59999999999997,
                             "invoiceNo":"1/11/2016",
                             "total":684.5999999999999
                          },
                          {  
                             "seller":"Mr Ma100don't-a",
                             "amount":94.7,
                             "invoiceNo":"1/12/2017",
                             "total":305.6
                          },
                          {  
                             "seller":"Mr Ma100don't-a",
                             "amount":210.9,
                             "invoiceNo":"1/10/2015",
                             "total":305.6
                          },
                          {  
                             "seller":"Pan Nieznany",
                             "amount":308,
                             "invoiceNo":"1/3/2016",
                             "total":684.5999999999999
                          }
                       ]
                    },
                    {  
                       "department":"Sales - X",
                       "invoices":"1/5/2017, 2/4/2015, 1/8/2017, 2/11/2016, 1/7/2016, 1/6/2015, 3/3/2015",
                       "sellerInvoices":[  
                          {  
                             "seller":"Dong King-Kong",
                             "amount":253.7,
                             "invoiceNo":"1/5/2017",
                             "total":1177.6
                          },
                          {  
                             "seller":"Byłem Tu",
                             "amount":17.2,
                             "invoiceNo":"2/4/2015",
                             "total":89.9
                          },
                          {  
                             "seller":"Dong King-Kong",
                             "amount":347.6,
                             "invoiceNo":"1/8/2017",
                             "total":1177.6
                          },
                          {  
                             "seller":"Byłem Tu",
                             "amount":4.2,
                             "invoiceNo":"2/11/2016",
                             "total":89.9
                          },
                          {  
                             "seller":"Byłem Tu",
                             "amount":68.5,
                             "invoiceNo":"1/7/2016",
                             "total":89.9
                          },
                          {  
                             "seller":"Dong King-Kong",
                             "amount":417.3,
                             "invoiceNo":"1/6/2015",
                             "total":1177.6
                          },
                          {  
                             "seller":"Dong King-Kong",
                             "amount":159,
                             "invoiceNo":"3/3/2015",
                             "total":1177.6
                          }
                       ]
                    },
                    {  
                       "department":"Sales - Y",
                       "invoices":"2/5/2017, 2/10/2015, 2/2/2015, 1/11/2015, 2/6/2017, 2/4/2016, 2/9/2016, 3/6/2017",
                       "sellerInvoices":[  
                          {  
                             "seller":"Mr Siabadaba",
                             "amount":252.20000000000002,
                             "invoiceNo":"2/5/2017",
                             "total":262.40000000000003
                          },
                          {  
                             "seller":"Nowy Kowalski",
                             "amount":211.1,
                             "invoiceNo":"2/10/2015",
                             "total":814.4
                          },
                          {  
                             "seller":"Nowy Kowalski",
                             "amount":151.8,
                             "invoiceNo":"2/2/2015",
                             "total":814.4
                          },
                          {  
                             "seller":"Nowy Kowalski",
                             "amount":50,
                             "invoiceNo":"1/11/2015",
                             "total":814.4
                          },
                          {  
                             "seller":"Aba Ukulele",
                             "amount":184.6,
                             "invoiceNo":"2/6/2017",
                             "total":184.6
                          },
                          {  
                             "seller":"Nowy Kowalski",
                             "amount":93.3,
                             "invoiceNo":"2/4/2016",
                             "total":814.4
                          },
                          {  
                             "seller":"Mr Siabadaba",
                             "amount":10.200000000000001,
                             "invoiceNo":"2/9/2016",
                             "total":262.40000000000003
                          },
                          {  
                             "seller":"Nowy Kowalski",
                             "amount":308.2,
                             "invoiceNo":"3/6/2017",
                             "total":814.4
                          }
                       ]
                    }
                 ]
              },
              {  
                 "region":"France",
                 "regionFirst":"France",
                 "departments":[  
                    {  
                       "department":"Sales - Y",
                       "invoices":"1/2/2015, 1/9/2016, 1/3/2017, 1/1/2017, 1/5/2015, 1/4/2016, 2/3/2015",
                       "sellerInvoices":[  
                          {  
                             "seller":"Mr France 6",
                             "amount":0.2,
                             "invoiceNo":"1/2/2015",
                             "total":188.17499999999998
                          },
                          {  
                             "seller":"Mr France 6",
                             "amount":58,
                             "invoiceNo":"1/9/2016",
                             "total":188.17499999999998
                          },
                          {  
                             "seller":"Mr France 6",
                             "amount":68.85,
                             "invoiceNo":"1/3/2017",
                             "total":188.17499999999998
                          },
                          {  
                             "seller":"Mr France 6",
                             "amount":19.4,
                             "invoiceNo":"1/1/2017",
                             "total":188.17499999999998
                          },
                          {  
                             "seller":"Mr France 6",
                             "amount":13.95,
                             "invoiceNo":"1/5/2015",
                             "total":188.17499999999998
                          },
                          {  
                             "seller":"Mr France 1",
                             "amount":13.625,
                             "invoiceNo":"1/4/2016",
                             "total":13.625
                          },
                          {  
                             "seller":"Mr France 6",
                             "amount":27.775,
                             "invoiceNo":"2/3/2015",
                             "total":188.17499999999998
                          }
                       ]
                    },
                    {  
                       "department":"Sales - Z",
                       "invoices":"1/9/2017, 1/5/2016, 2/12/2017, 1/3/2015, 2/8/2017, 1/8/2015, 1/7/2015, 3/12/2017, 3/11/2016, 1/11/2017, 3/10/2015, 1/12/2016, 3/8/2017, 2/11/2017, 2/6/2016",
                       "sellerInvoices":[  
                          {  
                             "seller":"Mr France 2",
                             "amount":52.725,
                             "invoiceNo":"1/9/2017",
                             "total":127.87500000000001
                          },
                          {  
                             "seller":"Mr France 3",
                             "amount":72.325,
                             "invoiceNo":"1/5/2016",
                             "total":258.15
                          },
                          {  
                             "seller":"Mr France 5",
                             "amount":125.725,
                             "invoiceNo":"2/12/2017",
                             "total":282.17499999999995
                          },
                          {  
                             "seller":"Mr France 4",
                             "amount":56.35,
                             "invoiceNo":"1/3/2015",
                             "total":60.7
                          },
                          {  
                             "seller":"Mr France 3",
                             "amount":3.575,
                             "invoiceNo":"2/8/2017",
                             "total":258.15
                          },
                          {  
                             "seller":"Mr France 2",
                             "amount":49.825,
                             "invoiceNo":"1/8/2015",
                             "total":127.87500000000001
                          },
                          {  
                             "seller":"Mr France 5",
                             "amount":14.3,
                             "invoiceNo":"1/7/2015",
                             "total":282.17499999999995
                          },
                          {  
                             "seller":"Mr France 3",
                             "amount":2.5,
                             "invoiceNo":"3/12/2017",
                             "total":258.15
                          },
                          {  
                             "seller":"Mr France 2",
                             "amount":25.325,
                             "invoiceNo":"3/11/2016",
                             "total":127.87500000000001
                          },
                          {  
                             "seller":"Mr France 5",
                             "amount":24.549999999999997,
                             "invoiceNo":"1/11/2017",
                             "total":282.17499999999995
                          },
                          {  
                             "seller":"Mr France 5",
                             "amount":117.6,
                             "invoiceNo":"3/10/2015",
                             "total":282.17499999999995
                          },
                          {  
                             "seller":"Mr France 3",
                             "amount":104.32499999999999,
                             "invoiceNo":"1/12/2016",
                             "total":258.15
                          },
                          {  
                             "seller":"Mr France 3",
                             "amount":50.175,
                             "invoiceNo":"3/8/2017",
                             "total":258.15
                          },
                          {  
                             "seller":"Mr France 4",
                             "amount":4.3500000000000005,
                             "invoiceNo":"2/11/2017",
                             "total":60.7
                          },
                          {  
                             "seller":"Mr France 3",
                             "amount":25.25,
                             "invoiceNo":"2/6/2016",
                             "total":258.15
                          }
                       ]
                    }
                 ]
              }
           ])
          );
        });

        it('Selects two groups from which one doesn\'t have aggregation including Query grouping', () => {
        
            var result = new ua.Query()
                .select({
                    sumByRegion: 'SUM(row.invoiceAmount)',
                    region: 'row.departmentRegion',
                    accounts: ua.group('row.accountId').by('row.accountId'),
                    departments: ua.group('SUM(row.invoiceAmount).toFixed(2)').by(['row.department'])
                })
                .groupBy('row.departmentRegion')
                .from(testData.slice(0, 10))
                .toList();
  
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "sumByRegion":181.15,
                        "region":"Germany",
                        "accounts":[9,10,11],
                        "departments":["86.18","94.97"]
                    },
                    {
                        "sumByRegion":953.1,
                        "region":"Poland",
                        "accounts":[2,3,7,8],
                        "departments":["682.20","270.90"]
                    },
                    {
                        "sumByRegion":52.925000000000004,
                        "region":"France",
                        "accounts":[13,17],
                        "departments":["0.20","52.73"]
                    }
                ])
            );
        });

        it('Selects two groups from which one is ungroup that doesn\'t have aggregation, without Query grouping', () => {
        
            var result = new ua.Query()
                .select({
                    all: ua.ungroup('row.invoiceNo'),
                    lastRegion: 'row.departmentRegion',
                    departments: ua.group({
                        department: 'CONCAT(row.department)',
                    })
                })
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();
  
            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "all":[  
                            "1/6/2016",
                            "1/11/2016",
                            "1/2/2015",
                            "1/12/2017",
                            "1/5/2017",
                            "1/4/2015",
                            "1/6/2017",
                            "2/4/2015",
                            "1/9/2017",
                            "1/10/2015"
                        ],
                        "lastRegion":"Poland",
                        "departments":[  
                            {  
                                "department":"Sales - Y, Sales - Z, Sales - Y, Sales - Z, Sales - X, Sales - Y, Sales - X, Sales - X, Sales - Z, Sales - Z"
                            }
                        ]
                    }
                ])
            );
        });

        it('Concatenate invoices per regions within group, also sum invoices within Query selector without grouping', () => {
        
            var result = new ua.Query()
                .select({
                    lastRegionInvoices: 'CONCAT(row.invoiceNo) OVER (row.departmentRegion)',
                    amount: 'SUM(row.invoiceAmount).toFixed(2) + " " + row.currency',
                    regions: ua.group({
                        region: 'row.departmentRegion',
                        invoices: 'CONCAT(row.invoiceNo) OVER (row.departmentRegion)',
                    }).by('row["departmentRegion"]')
                })
                .from(testData.slice(0, 10))
                .groupBy()
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([  
                    {  
                        "lastRegionInvoices":"1/2/2015, 1/9/2017",
                        "amount":"1187.17 PLN",
                        "regions":[  
                            {  
                                "region":"Germany",
                                "invoices":"1/6/2016, 1/4/2015, 1/6/2017"
                            },
                            {  
                                "region":"Poland",
                                "invoices":"1/11/2016, 1/12/2017, 1/5/2017, 2/4/2015, 1/10/2015"
                            },
                            {  
                                "region":"France",
                                "invoices":"1/2/2015, 1/9/2017"
                            }
                        ]
                    }
                ])
            );
        });

        it('Selects same aggregations across different groups with overlaping groupings', () => {
        
            var result = new ua.Query()
                .select({
                    sumByRegion: 'SUM(row.invoiceAmount).toFixed(2)',
                    InvoicesPerSeller: ua.group('CONCAT(row.invoiceNo) ORDER_BY()').by('row.accountId'),
                    squreSumByDepartment: ua.group('SUM(SUM(row.invoiceAmount)).toFixed(2)').by('row.department'),
                    sellers: ua.group({
                        department: 'row.department',
                        invoicesAmount: 'SUM(row.invoiceAmount).toFixed(2)',
                        invoices: 'CONCAT(row.invoiceNo) ORDER_BY()'
                    }).by(['row.department', 'row.accountId']),
                    allSellers: ua.ungroup({
                        amount: 'row.invoiceAmount',
                        seller: 'row.userName + " " + row.userSurname'
                    }),
                    allInvoices: ua.ungroup({
                        amount: 'row.invoiceAmount',
                        invoice: 'row.invoiceNo'
                    })
                })
                .groupBy('row.departmentRegion')
                .from(testData.slice(0, 50))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "sumByRegion": "665.93",
                        "InvoicesPerSeller": ["1/10/2017, 1/4/2015, 2/1/2017","1/2/2017, 1/6/2016, 2/10/2017, 3/4/2015, 4/12/2017","1/6/2017"],
                        "squreSumByDepartment": ["4567.60","94.97"],
                        "sellers": [
                            {"department":"Sales - Y","invoicesAmount":"155.18","invoices":"1/10/2017, 1/4/2015, 2/1/2017"},
                            {"department":"Sales - Y","invoicesAmount":"415.78","invoices":"1/2/2017, 1/6/2016, 2/10/2017, 3/4/2015, 4/12/2017"},
                            {"department":"Sales - X","invoicesAmount":"94.97","invoices":"1/6/2017"}
                        ],
                        "allSellers":[{"amount":69.525,"seller":"Osama Inasyp"},{"amount":16.65,"seller":"Hasib Inasyp"},{"amount":94.975,"seller":"Mr Trugerman"},{"amount":99.95,"seller":"Osama Inasyp"},{"amount":102.875,"seller":"Hasib Inasyp"},{"amount":103.6,"seller":"Osama Inasyp"},{"amount":35.65,"seller":"Hasib Inasyp"},{"amount":108.22500000000001,"seller":"Osama Inasyp"},{"amount":34.474999999999994,"seller":"Osama Inasyp"}],
                        "allInvoices":[{"amount":69.525,"invoice":"1/6/2016"},{"amount":16.65,"invoice":"1/4/2015"},{"amount":94.975,"invoice":"1/6/2017"},{"amount":99.95,"invoice":"1/2/2017"},{"amount":102.875,"invoice":"1/10/2017"},{"amount":103.6,"invoice":"2/10/2017"},{"amount":35.65,"invoice":"2/1/2017"},{"amount":108.22500000000001,"invoice":"3/4/2015"},{"amount":34.474999999999994,"invoice":"4/12/2017"}]
                    },
                    {
                        "sumByRegion": "3519.10",
                        "InvoicesPerSeller": [
                            "1/5/2017, 1/6/2015, 1/8/2017, 3/3/2015",
                            "1/7/2016, 2/11/2016, 2/4/2015",
                            "1/11/2015, 2/10/2015, 2/2/2015, 2/4/2016, 3/6/2017",
                            "2/6/2017",
                            "2/5/2017, 2/9/2016",
                            "1/10/2015, 1/12/2017",
                            "1/11/2016, 1/3/2016"
                        ],
                        "squreSumByDepartment":["3960.80","8872.50","10091.20"],
                        "sellers":[
                            {"department":"Sales - Z","invoicesAmount":"305.60","invoices":"1/10/2015, 1/12/2017"},
                            {"department":"Sales - Z","invoicesAmount":"684.60","invoices":"1/11/2016, 1/3/2016"},
                            {"department":"Sales - X","invoicesAmount":"1177.60","invoices":"1/5/2017, 1/6/2015, 1/8/2017, 3/3/2015"},
                            {"department":"Sales - X","invoicesAmount":"89.90","invoices":"1/7/2016, 2/11/2016, 2/4/2015"},
                            {"department":"Sales - Y","invoicesAmount":"814.40","invoices":"1/11/2015, 2/10/2015, 2/2/2015, 2/4/2016, 3/6/2017"},
                            {"department":"Sales - Y","invoicesAmount":"184.60","invoices":"2/6/2017"},
                            {"department":"Sales - Y","invoicesAmount":"262.40","invoices":"2/5/2017, 2/9/2016"}
                        ],
                        "allSellers":[{"amount":376.59999999999997,"seller":"Pan Nieznany"},{"amount":94.7,"seller":"Mr Ma100don't-a"},{"amount":253.7,"seller":"Dong King-Kong"},{"amount":17.2,"seller":"Byłem Tu"},{"amount":210.9,"seller":"Mr Ma100don't-a"},{"amount":347.6,"seller":"Dong King-Kong"},{"amount":308,"seller":"Pan Nieznany"},{"amount":252.20000000000002,"seller":"Mr Siabadaba"},{"amount":211.1,"seller":"Nowy Kowalski"},{"amount":4.2,"seller":"Byłem Tu"},{"amount":68.5,"seller":"Byłem Tu"},{"amount":151.8,"seller":"Nowy Kowalski"},{"amount":50,"seller":"Nowy Kowalski"},{"amount":184.6,"seller":"Aba Ukulele"},{"amount":93.3,"seller":"Nowy Kowalski"},{"amount":10.200000000000001,"seller":"Mr Siabadaba"},{"amount":308.2,"seller":"Nowy Kowalski"},{"amount":417.3,"seller":"Dong King-Kong"},{"amount":159,"seller":"Dong King-Kong"}],
                        "allInvoices":[{"amount":376.59999999999997,"invoice":"1/11/2016"},{"amount":94.7,"invoice":"1/12/2017"},{"amount":253.7,"invoice":"1/5/2017"},{"amount":17.2,"invoice":"2/4/2015"},{"amount":210.9,"invoice":"1/10/2015"},{"amount":347.6,"invoice":"1/8/2017"},{"amount":308,"invoice":"1/3/2016"},{"amount":252.20000000000002,"invoice":"2/5/2017"},{"amount":211.1,"invoice":"2/10/2015"},{"amount":4.2,"invoice":"2/11/2016"},{"amount":68.5,"invoice":"1/7/2016"},{"amount":151.8,"invoice":"2/2/2015"},{"amount":50,"invoice":"1/11/2015"},{"amount":184.6,"invoice":"2/6/2017"},{"amount":93.3,"invoice":"2/4/2016"},{"amount":10.200000000000001,"invoice":"2/9/2016"},{"amount":308.2,"invoice":"3/6/2017"},{"amount":417.3,"invoice":"1/6/2015"},{"amount":159,"invoice":"3/3/2015"}]
                    },
                    {
                        "sumByRegion":"930.70",
                        "InvoicesPerSeller":["1/4/2016","1/8/2015, 1/9/2017, 3/11/2016","1/12/2016, 1/5/2016, 2/6/2016, 2/8/2017, 3/12/2017, 3/8/2017","1/3/2015, 2/11/2017","1/11/2017, 1/7/2015, 2/12/2017, 3/10/2015","1/1/2017, 1/2/2015, 1/3/2017, 1/5/2015, 1/9/2016, 2/3/2015"],
                        "squreSumByDepartment":["1412.60","10933.50"],
                        "sellers":[{"department":"Sales - Y","invoicesAmount":"13.63","invoices":"1/4/2016"},{"department":"Sales - Y","invoicesAmount":"188.17","invoices":"1/1/2017, 1/2/2015, 1/3/2017, 1/5/2015, 1/9/2016, 2/3/2015"},{"department":"Sales - Z","invoicesAmount":"127.88","invoices":"1/8/2015, 1/9/2017, 3/11/2016"},{"department":"Sales - Z","invoicesAmount":"258.15","invoices":"1/12/2016, 1/5/2016, 2/6/2016, 2/8/2017, 3/12/2017, 3/8/2017"},{"department":"Sales - Z","invoicesAmount":"60.70","invoices":"1/3/2015, 2/11/2017"},{"department":"Sales - Z","invoicesAmount":"282.17","invoices":"1/11/2017, 1/7/2015, 2/12/2017, 3/10/2015"}],
                        "allSellers":[{"amount":0.2,"seller":"Mr France 6"},{"amount":52.725,"seller":"Mr France 2"},{"amount":72.325,"seller":"Mr France 3"},{"amount":125.725,"seller":"Mr France 5"},{"amount":56.35,"seller":"Mr France 4"},{"amount":3.575,"seller":"Mr France 3"},{"amount":58,"seller":"Mr France 6"},{"amount":68.85,"seller":"Mr France 6"},{"amount":19.4,"seller":"Mr France 6"},{"amount":13.95,"seller":"Mr France 6"},{"amount":49.825,"seller":"Mr France 2"},{"amount":14.3,"seller":"Mr France 5"},{"amount":2.5,"seller":"Mr France 3"},{"amount":25.325,"seller":"Mr France 2"},{"amount":24.549999999999997,"seller":"Mr France 5"},{"amount":13.625,"seller":"Mr France 1"},{"amount":117.6,"seller":"Mr France 5"},{"amount":27.775,"seller":"Mr France 6"},{"amount":104.32499999999999,"seller":"Mr France 3"},{"amount":50.175,"seller":"Mr France 3"},{"amount":4.3500000000000005,"seller":"Mr France 4"},{"amount":25.25,"seller":"Mr France 3"}],
                        "allInvoices":[{"amount":0.2,"invoice":"1/2/2015"},{"amount":52.725,"invoice":"1/9/2017"},{"amount":72.325,"invoice":"1/5/2016"},{"amount":125.725,"invoice":"2/12/2017"},{"amount":56.35,"invoice":"1/3/2015"},{"amount":3.575,"invoice":"2/8/2017"},{"amount":58,"invoice":"1/9/2016"},{"amount":68.85,"invoice":"1/3/2017"},{"amount":19.4,"invoice":"1/1/2017"},{"amount":13.95,"invoice":"1/5/2015"},{"amount":49.825,"invoice":"1/8/2015"},{"amount":14.3,"invoice":"1/7/2015"},{"amount":2.5,"invoice":"3/12/2017"},{"amount":25.325,"invoice":"3/11/2016"},{"amount":24.549999999999997,"invoice":"1/11/2017"},{"amount":13.625,"invoice":"1/4/2016"},{"amount":117.6,"invoice":"3/10/2015"},{"amount":27.775,"invoice":"2/3/2015"},{"amount":104.32499999999999,"invoice":"1/12/2016"},{"amount":50.175,"invoice":"3/8/2017"},{"amount":4.3500000000000005,"invoice":"2/11/2017"},{"amount":25.25,"invoice":"2/6/2016"}]
                    }
                ])
            );
        });

        

        it('Selects same aggregations across different groups, one of it should be primal with OVER non starting from root of outer scope grouping', () => {
        
            var result = new ua.Query()
                .select({
                    regionsInvoices: ua.ungroup('row.invoiceNo'),
                    departmentsFirstSeller: 'FIRST(row.userName + ": " + SUM(row.invoiceAmount) OVER (row.department, row.accountId))ORDER_BY(row.userName)',
                    sellers: ua.group({
                        sumOfInvoices: 'SUM(row.invoiceAmount)',
                        sumByDepartment: 'SUM(row.invoiceAmount) OVER (row.department)'
                    }).by([ 'row.department', 'row.accountId' ])
                })
                .groupBy([ 'row.departmentRegion' ])
                .from(testData.slice(0, 40))
                .toList();

            assert.equal(
                JSON.stringify(result),
                JSON.stringify([
                    {
                        "regionsInvoices": ["1/6/2016","1/4/2015","1/6/2017","1/2/2017","1/10/2017","2/10/2017","2/1/2017","3/4/2015" ],
                        "departmentsFirstSeller": "Hasib: 155.175",
                        "sellers": [
                            { "sumOfInvoices": 155.175, "sumByDepartment": 1587.975 },
                            { "sumOfInvoices": 381.30000000000007, "sumByDepartment": 1587.975 },
                            { "sumOfInvoices": 94.975, "sumByDepartment": 786.175 }
                        ]
                    },
                    {
                        "regionsInvoices": [ "1/11/2016","1/12/2017","1/5/2017","2/4/2015","1/10/2015","1/8/2017","1/3/2016","2/5/2017","2/10/2015","2/11/2016","1/7/2016","2/2/2015","1/11/2015","2/6/2017" ],
                        "departmentsFirstSeller": "Aba: 184.6",
                        "sellers": [
                            { "sumOfInvoices": 305.6, "sumByDepartment": 1535 },
                            { "sumOfInvoices": 684.5999999999999, "sumByDepartment": 1535 },
                            { "sumOfInvoices": 601.3, "sumByDepartment": 786.175 },
                            { "sumOfInvoices": 89.9, "sumByDepartment": 786.175 },
                            { "sumOfInvoices": 412.9, "sumByDepartment": 1587.975 },
                            { "sumOfInvoices": 184.6, "sumByDepartment": 1587.975 },
                            { "sumOfInvoices": 252.20000000000002, "sumByDepartment": 1587.975 }
                        ]
                    },
                    {
                        "regionsInvoices": [ "1/2/2015","1/9/2017","1/5/2016","2/12/2017","1/3/2015","2/8/2017","1/9/2016","1/3/2017","1/1/2017","1/5/2015","1/8/2015","1/7/2015","3/12/2017","3/11/2016","1/11/2017","1/4/2016","3/10/2015","2/3/2015" ],
                        "departmentsFirstSeller": "Mr: 188.17499999999998",
                        "sellers": [
                            { "sumOfInvoices": 13.625, "sumByDepartment": 1587.975 },
                            { "sumOfInvoices": 188.17499999999998, "sumByDepartment": 1587.975 },
                            { "sumOfInvoices": 127.87500000000001, "sumByDepartment": 1535 },
                            { "sumOfInvoices": 78.4, "sumByDepartment": 1535 },
                            { "sumOfInvoices": 56.35, "sumByDepartment": 1535 },
                            { "sumOfInvoices": 282.17499999999995, "sumByDepartment": 1535 }
                        ]
                    }
                ])
            );
        });
    });
});
