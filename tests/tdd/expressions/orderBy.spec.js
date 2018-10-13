const assert = require('assert');
const utils = require('../../../bin/common/utils');
const OrderBy = require('../../../bin/expressions/orderBy').OrderBy;

describe('Test orderBy', () => {
    beforeEach(() => {
        var id = 0;
        utils.generateId = () => utils.formatId(++id);
    });

    it('defineComparator by ASC VALUE', () => {
        var quotes = {};
        var orderBy = new OrderBy('ASC', quotes);
        var comparator = new Function('__quotes__', 'out', '__outB__', OrderBy.defineComparator([orderBy]));
        var compare = comparator.bind(null, quotes);

        assert.equal(1, compare(null, undefined));
        assert.equal(0, compare(null, null));
        assert.equal(0, compare(undefined, undefined));
        assert.equal(-1, compare(undefined, null));
        assert.equal(1, compare(1, undefined));
        assert.equal(1, compare(true, undefined));
        assert.equal(1, compare('x', undefined));
        assert.equal(-1, compare(undefined, 1));
        assert.equal(-1, compare(undefined, true));
        assert.equal(-1, compare(undefined, 'y'));
        assert.equal(1, compare(1, null));
        assert.equal(1, compare(true, null));
        assert.equal(1, compare('x', null));
        assert.equal(-1, compare(null, 1));
        assert.equal(-1, compare(null, true));
        assert.equal(-1, compare(null, 'y'));

        assert.equal(-1, compare('12', '2'));
        assert.equal(1, compare('2', '12'));
        assert.equal(-1, compare('x', 'yz'));
        assert.equal(1, compare('yz', 'x'));

        assert.equal(1, compare(12, 2));
        assert.equal(-1, compare(2, 12));
        assert.equal(-1, compare(false, true));
    });

    it('defineComparator by DESC VALUE', () => {
        var quotes = {};
        var orderByDesc = new OrderBy('DESC', quotes);
        var comparator = new Function('__quotes__', 'out', '__outB__', OrderBy.defineComparator([orderByDesc]));
        var compare = comparator.bind(null, quotes);

        assert.equal(-1, compare(null, undefined));
        assert.equal(0, compare(null, null));
        assert.equal(0, compare(undefined, undefined));
        assert.equal(1, compare(undefined, null));
        assert.equal(-1, compare(1, undefined));
        assert.equal(-1, compare(true, undefined));
        assert.equal(-1, compare('x', undefined));
        assert.equal(1, compare(undefined, 1));
        assert.equal(1, compare(undefined, true));
        assert.equal(1, compare(undefined, 'y'));
        assert.equal(-1, compare(1, null));
        assert.equal(-1, compare(true, null));
        assert.equal(-1, compare('x', null));
        assert.equal(1, compare(null, 1));
        assert.equal(1, compare(null, true));
        assert.equal(1, compare(null, 'y'));

        assert.equal(1, compare('12', '2'));
        assert.equal(-1, compare('2', '12'));
        assert.equal(1, compare('x', 'yz'));
        assert.equal(-1, compare('yz', 'x'));

        assert.equal(-1, compare(12, 2));
        assert.equal(1, compare(2, 12));
        assert.equal(1, compare(false, true));
    });

    it('defineComparator by complex values', () => {
        var quotes = {};
        var orderByRegion = new OrderBy('out.region', quotes);
        var orderByInvoiceDesc = new OrderBy('DESC out.invoiceNo', quotes);
        var comparator = new Function('__quotes__', 'out', '__outB__', OrderBy.defineComparator([orderByRegion, orderByInvoiceDesc]));
        var compare = comparator.bind(null, quotes);

        assert.equal(1, compare({ region: 'Poland', invoiceNo: 1 }, { region: 'France', invoiceNo: 2 }));
        assert.equal(-1, compare({ region: 'France', invoiceNo: 2 }, { region: 'Poland', invoiceNo: 1 }));
        assert.equal(0, compare({ region: 'Poland', invoiceNo: 1 }, { region: 'Poland', invoiceNo: 1 }));
        assert.equal(1, compare({ region: 'Poland', invoiceNo: 1 }, { region: 'Poland', invoiceNo: 2 }));
        assert.equal(-1, compare({ region: 'Poland', invoiceNo: 2 }, { region: 'Poland', invoiceNo: 1 }));

        assert.equal(-1, compare({ region: null, invoiceNo: 2 }, { region: 'Poland', invoiceNo: 1 }));
        assert.equal(1, compare({ region: 'Poland', invoiceNo: 1 }, { region: null, invoiceNo: 1 }));
        assert.equal(0, compare({ region: null, invoiceNo: null }, { region: null, invoiceNo: null }));
        assert.equal(0, compare({ region: null, invoiceNo: 1 }, { region: null, invoiceNo: 1 }));

        assert.equal(1, compare({ region: null, invoiceNo: undefined }, { region: null, invoiceNo: 1 }));
        assert.equal(-1, compare({ region: null, invoiceNo: 1 }, { region: null, invoiceNo: undefined }));
        assert.equal(0, compare({ region: undefined, invoiceNo: undefined }, { region: undefined, invoiceNo: undefined }));
        assert.equal(0, compare({ region: undefined, invoiceNo: 1 }, { region: undefined, invoiceNo: 1 }));
    });

    describe('Parsing', () => {
        // TODO::
    });
});
