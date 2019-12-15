const assert = require('assert');
const utils = require('../../bin/common/utils');
const expression = require('../../bin/expressions/expression');
const Expression = expression.Expression;
const ExpressionType = require('../../bin/constants/expressionType').ExpressionType;


describe('Test Expression', () => {
    beforeEach(() => {
        var id = 0;
        utils.generateId = () => utils.formatId(++id);
    });
    
    describe('Code normalization', () => {
        it('replace comments', () => {

            var expression = new Expression(ExpressionType.FIELD,
`
/* /* */
`
            );

            assert.equal(expression.code, ``);
        });

        it('replace multiline comments', () => {

            var expression = new Expression(ExpressionType.FIELD,
`
/*
//
/*
// commented text
*/

preComment = 1 // commented text
`
            );

            assert.equal(expression.code, `preComment = 1`);
        });

        it('ending semicolon removal', () => {

            var expression = new Expression(ExpressionType.FIELD, 'preComment = 1;');

            assert.equal(expression.code, `preComment = 1`);
        });

        it('replace double and single quotes', () => {
            
            var expression = new Expression(ExpressionType.FIELD,
`"\\"" + '\\'' +
"\\\\" +
'\\\\';`,
                {}
            );

            assert.equal(expression.code,
`__quotes__.__2__  +  __quotes__.__3__  +
 __quotes__.__4__  +
 __quotes__.__4__ `
            );
        });

        it('replace multiline quotes', () => {
            
            var expression = new Expression(ExpressionType.FIELD,
`\`
\\\`
\` +
\`\`;`,
                {}
            );

            assert.equal(expression.code,
`__quotes__.__2__  +
 __quotes__.__3__ `
            );
        });
    });
});
