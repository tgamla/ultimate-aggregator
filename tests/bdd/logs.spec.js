var assert = require('assert');
var logger = require('../../bin/common/logger');
var ua = require('../../bin/aggregator');
var testData = require('../testData');

// TODO:: use chai
describe('Test Logger', () => {
    const originalLogger = logger.Logger;
    const LoggerMock = function() { };
    var loggerMockProto;

    beforeEach(() => {
        logger.Logger = LoggerMock;
        loggerMockProto = LoggerMock.prototype = {
            debugObject: function(level, msg, obj) { },
            debug: function(level, msg) { },
            log: function(msg) { },
            warning: function(msg) { },
            error: function(msg) { },
            formatMessage: function(type, msg) { }
        };
    });

    afterEach(() => {
        logger.Logger = originalLogger;
    });

    describe('Logs', () => {

        it('debug messages', () => {
            var allMessages = [];
            loggerMockProto.debug = () => {
                allMessages.push("code");
            };
            loggerMockProto.debugObject = (msg) => {
                allMessages.push(msg);
            };

            ua.query({ debugLevel: 2 })
                .select(ua.group('row').by('row  [ "departmentRegion" ]'))
                .groupBy(['row.departmentRegion', 'row.department'])
                .execute();

            assert.equal(
                JSON.stringify(["Query","Expression","Expression","Expression","Expression","code","Input Data","Grouped Aggregations","Results"]),
                JSON.stringify(allMessages)
                );
        });

        it('group without grouping', () => {
            var messageCode, refObj;
            loggerMockProto.log = (msg, obj) => {
                messageCode = msg;
                refObj = obj;
            };

            ua.query()
                .select(ua.group('row'))
                .execute();

            assert.equal(3, messageCode);
            assert.equal(
                JSON.stringify('row'),
                JSON.stringify(refObj)
                );
        });

        it('redundant grouping', () => {
            var messageCode, refObj;
            loggerMockProto.log = (msg, obj) => {
                messageCode = msg;
                refObj = obj;
            };

            ua.query()
                .select(ua.group('row').by('row  [ "departmentRegion" ]'))
                .groupBy(['row.departmentRegion', 'row.department'])
                .execute();

            assert.equal(4, messageCode);
            assert.equal(
                JSON.stringify('row  [ "departmentRegion" ]'),
                JSON.stringify(refObj)
                );
        });

        it('group within ungroup', () => {
            var messageCode, refObj;
            loggerMockProto.log = (msg, obj) => {
                messageCode = msg;
                refObj = obj;
            };

            ua.query()
                .select(ua.ungroup(ua.group('row')))
                .groupBy(['row.departmentRegion', 'row.department'])
                .execute();

            assert.equal(2, messageCode);
            assert.equal(
                JSON.stringify('row'),
                JSON.stringify(refObj)
                );
        });

        it('group within ungroup', () => {
            var message;
            loggerMockProto.error = (msg) => {
                message = msg;
            };

            ua.query()
                .select(ua.ungroup(ua.group('row').by('row  [ "departmentRegion" ]')))
                .groupBy(['row.departmentRegion', 'row.department'])
                .execute();
                
            assert.equal('Group with non empty grouping is not permitted within Ungroup!\n"row"', message);
        });

        it('ungroup within ungroup', () => {
            var message, refObj;
            loggerMockProto.log = (msg, obj) => {
                message = msg;
                refObj = obj;
            };

            ua.query()
                .select(ua.ungroup(ua.ungroup('row')))
                .groupBy(['row.departmentRegion', 'row.department'])
                .execute();

            assert.equal(1, message);
            assert.equal(
                JSON.stringify('row'),
                JSON.stringify(refObj)
                );
        });

        it('aggregation with OVER exceeding parents grouping', () => {
            var message;
            loggerMockProto.error = (msg) => {
                message = msg;
            };

            ua.query()
                .select('CONCAT(row.department) OVER (row.department)')
                .groupBy('row["departmentRegion"]')
                .toList();

            assert.equal('Primal aggregation cannot have grouping that exceeds over outer scope non empty grouping!\nCONCAT(row.department) OVER (row.department)', message);
        });

        it('aggregation with OVER exceeding parents grouping', () => {
            var message;
            loggerMockProto.error = (msg) => {
                message = msg;
            };

            ua.query()
                .select('CONCAT(row.department) OVER (row.department)')
                .groupBy('row["departmentRegion"]')
                .toList();

            assert.equal('Primal aggregation cannot have grouping that exceeds over outer scope non empty grouping!\nCONCAT(row.department) OVER (row.department)', message);
        });

        it('using index within grouped Expression', () => {
            var message, rawField;
            loggerMockProto.warning = (msg, field) => {
                message = msg;
                rawField = field;
            };

            ua.query()
                .select('(index + "")')
                .groupBy('row["departmentRegion"]')
                .toList();

            assert.equal(5, message);
            assert.equal("(index + \"\")", rawField);
        });

        it('Passing unsupported data type to Query', () => {
            var message;
            loggerMockProto.warning = (msg) => {
                message = msg;
            };

            ua.query().from(12);

            assert.equal(7, message);
        });

        it('Pass anonymous function to context', () => {
            var code, func;
            loggerMockProto.warning = (msgCode, fn) => {
                code = msgCode;
                func = fn;
            };

            ua.query().addContext(function() {});

            assert.equal(8, code);
            assert.equal("function () {}", func.toString());
        });

        it('Pass array to context as reference', () => {
            var code, array;
            loggerMockProto.warning = (msgCode, arr) => {
                code = msgCode;
                array = arr;
            };

            ua.query().addContext([1,2]);

            assert.equal(9, code);
            assert.equal("[1,2]", JSON.stringify(array));
        });

        it('Pass null value to context as reference', () => {
            var code, value;
            loggerMockProto.warning = (msgCode, val) => {
                code = msgCode;
                value = val;
            };

            ua.query().addContext(null);

            assert.equal(11, code);
            assert.equal(null, value);
        });

        it('Pass incorrect value to context as reference', () => {
            var code, value;
            loggerMockProto.warning = (msgCode, val) => {
                code = msgCode;
                value = val;
            };

            ua.query().addContext(true);

            assert.equal(10, code);
            assert.equal(true, value);
        });

        it('Unnecessary overall grouping', () => {
            var code, value;
            loggerMockProto.log = (msgCode, val) => {
                code = msgCode;
                value = val;
            };

            ua.query()
                .select('CONCAT(row.invoiceNo)OVER(,ALL)')
                .execute([]);

            assert.equal(12, code);
            assert.equal('CONCAT(row.invoiceNo)OVER(,ALL)', value);
        });
    });
});
