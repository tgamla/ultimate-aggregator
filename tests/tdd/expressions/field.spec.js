const assert = require('assert');
const utils = require('../../../bin/common/utils');
const Field = require('../../../bin/expressions/field').Field;
const aggregate = require('../../../bin/expressions/aggregate');
const AggregationType = aggregate.Aggregation;
const GroupBy = require('../../../bin/expressions/groupBy').GroupBy;
const expression = require('../../../bin/prototypes/expression');
const Type = expression.Type;

const loggerMock = {
    queryName: '',
    debugLevel: 0,
    debugParseToJSON: false,
    logLevel: 0,

    debugObject: function(level, msg, obj) { },
    debug: function(level, msg) { },
    log: function(msg) { },
    warning: function(msg) { },
    error: function(msg) { },
    formatMessage: function(type, msg) { }
};

describe('Test Field', () => {
    beforeEach(() => {
        var id = 0;
        utils.generateId = () => utils.formatId(++id);
    });

    describe('Parsing', () => {
        it('simple COUNT aggregation', () => {
            var expression = new Field(loggerMock, 'COUNT( true )', {}, []);

            assert.equal(expression.id, '__1__');
            assert.equal(expression.code, '__groupings__.__2__');
            assert.equal(expression.level, 0);
            assert.equal(expression.type, Type.FIELD);
            assert.equal(expression.raw, 'COUNT( true )');
            assert.equal(expression.normalized, '"COUNT"("true")');
        });

        it('inner COUNT aggregation', () => {
            var parentExp = new Field(loggerMock, ' COUNT( true ) ', {}, []);
            var expression = parentExp.innerExpressions[0];

            assert.equal(expression.id, '__2__');
            assert.equal(expression.code, 'ALL');
            assert.equal(expression.level, 1);
            assert.equal(expression.type, Type.AGGREGATE);
            assert.equal(expression.aggregation, AggregationType.COUNT);
            assert.equal(expression.raw, ' true ');
            assert.equal(expression.normalized, '"ALL"');
        });

        it('inner expression arguments', () => {
            var parentExp = new Field(loggerMock, ' CONCAT( true, getDelimiter(row["first value"]) ) ', {}, []);
            var innerExprArgument = parentExp.innerExpressions[0].arguments[0].code;

            assert.equal(innerExprArgument, 'getDelimiter(row[ __quotes__.__2__ ])');
        });

        it('DISTINCT aggregation', () => {
            var parentExp = new Field(loggerMock, ' AVG( DISTINCT row["first value"] ) ', {}, []);
            var expression = parentExp.innerExpressions[0];

            assert.equal(expression.hasDistinct, true);
            assert.equal(expression.code, ' row[ __quotes__.__2__ ]');
            assert.equal(expression.type, Type.AGGREGATE);
            assert.equal(expression.aggregation, AggregationType.AVG);
            assert.equal(expression.raw, ' DISTINCT row[ __quotes__.__2__ ] ');
            assert.equal(expression.normalized, '"row"["__quotes__"."__2__"]');
        });

        it('OVER aggregation', () => {
            var parentExp = new Field(loggerMock, 'COUNT(row.invoiceValue) OVER (row.firstName, row.lastName)', {}, []);
            var expression = parentExp.innerExpressions[0];

            assert.equal(parentExp.code, '__3__.__4__');
            assert.equal(expression.hasDistinct, false);
            assert.equal(expression.code, 'row.invoiceValue');
            assert.equal(expression.type, Type.AGGREGATE);
            assert.equal(expression.aggregation, AggregationType.COUNT);
            assert.equal(expression.raw, 'row.invoiceValue');
            assert.equal(expression.normalized, '"row"."invoiceValue"');
            assert.equal(expression.hasGroupByOver, true);

            assert.equal(expression.grouping[0].code, 'row.firstName');
        });

        it('NON OVER aggregation', () => {
            var parentExp = new Field(loggerMock, 'CONCAT(row.invoiceValue)', {}, [], null, []);
            var expression = parentExp.innerExpressions[0];

            assert.equal(expression.hasDistinct, false);
            assert.equal(expression.code, 'row.invoiceValue');
            assert.equal(expression.type, Type.AGGREGATE);
            assert.equal(expression.aggregation, AggregationType.CONCAT);
            assert.equal(expression.raw, 'row.invoiceValue');
            assert.equal(expression.normalized, '"row"."invoiceValue"');
            assert.equal(expression.hasGroupByOver, false);

            assert.equal(expression.grouping.length, 0);
        });

        it('optimize dot notation', () => {
            var expression = new Field(loggerMock, 'ifrow["department"]', {}, [], null, []);

            assert.equal(expression.code, 'ifrow.department');
            assert.equal(expression.raw, 'ifrow["department"]');
            assert.equal(expression.normalized, '"ifrow"."department"');
        });

        it('optimize dot notation with js syntax as property name', () => {
            var expression = new Field(loggerMock, 'row.  if["department"]', {}, [], null, []);

            assert.equal(expression.code, 'row.  if.department');
            assert.equal(expression.raw, 'row.  if["department"]');
            assert.equal(expression.normalized, '"row"."if"."department"');
        });

        it('optimize dot notation for sequentional brackets', () => {
            var expression = new Field(loggerMock, 'row["in"]["department"]', {}, [], null, []);

            assert.equal(expression.code, 'row.in.department');
            assert.equal(expression.raw, 'row["in"]["department"]');
            assert.equal(expression.normalized, '"row"."in"."department"');
        });

        it('omit dot optimization for js syntaxes', () => {
            var expression = new Field(loggerMock, 'row in["department"]', {}, [], null, []);

            assert.equal(expression.code, 'row in[ __quotes__.__2__ ]');
            assert.equal(expression.raw, 'row in["department"]');
            assert.equal(expression.normalized, '"row""in"["__quotes__"."__2__"]');
        });
    });

    describe('Siblings', () => {

        it('plain siblings', () => {
            var queryExpressions = [];

            var grouping = [ new GroupBy('row.userName', {}, queryExpressions, null) ];
            grouping.push(new GroupBy('row.userSurname', {}, queryExpressions, grouping[0].id));

            var exp1 = new Field(loggerMock, 'SUM(row.invoiceValue)', {}, queryExpressions, 1, grouping);
            var exp2 = new Field(loggerMock, 'SUM(row.invoiceValue)', {}, queryExpressions, null, grouping);

            assert.equal(exp1, exp2);
        });

        it('with OVER', () => {
            var queryExpressions = [];
            
            var grouping = [ new GroupBy('row.userName', {}, queryExpressions, null) ];
            grouping.push(new GroupBy('row.userSurname', {}, queryExpressions, grouping[0].id));

            var exp1 = new Field(loggerMock, 'COUNT(row.invoiceValue)', {}, queryExpressions, 1, grouping);
            var exp2 = new Field(loggerMock, 'COUNT(row.invoiceValue) OVER (row.userName, row.userSurname)', {}, queryExpressions, null, []);

            assert.notEqual(exp1, exp2);
            assert.equal(exp1.innerExpressions[0], exp2.innerExpressions[0]);
        });
    });
});
