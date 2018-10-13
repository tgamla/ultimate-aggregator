import * as utils from '../common/utils';
import { AggregateFunction } from '../aggregateFunction';

export class BaseQuery<T> implements IBaseQuery<T> {

    public id: string;
    public type: string;
    public _select: any;
    public _filter: string;
    public _distinct: boolean;
    public _groupBy: Array<string>;
    public _orderBy: Array<string>;
    public _asList: boolean;

    constructor(type: string) {
        this.id = utils.generateId();
        this.type = type;
        this._select = null;
        this._filter = null;
        this._distinct = false;
        this._groupBy = [];
        this._orderBy = [];
        this._asList = true;
        
        this.encapsulate();
    }

    public distinct(apply?: boolean): BaseQuery<T> {
        this.applyDistinct(apply);
        return this;
    }

    public filter(rawFilter?: /* TODO:: Function | */ string): BaseQuery<T> {
        this.applyFilter(rawFilter);
        return this;
    }

    public range(length: number, start?: number): BaseQuery<T> {
        // TODO::
        return this;
    }

    public orderBy(rawSorting?: string | Array<string>): BaseQuery<T> {
        this.applyList(rawSorting, '_orderBy');
        return this;
    }

    public asObject(propertyExpression?: string): BaseQuery<T> {
        // TODO::
        // If propertyExpression not defined then use indexing as in Array
        return this;
    }

    public asList(): BaseQuery<T> {
        // TODO::
        return this;
    }

    public asValue(propName?: string): BaseQuery<T> {
        // TODO::
        // If propName && selector is non primitive then thro warning/error
        return this;
    }

    protected encapsulate(): void {
        // TODO::
    }

    protected applySelect(...args: Array<any>): void {
        this._select = utils.map(args, (arg: any) => this.copySelect(arg))[0]; // TODO:: remove index slector
    }

    protected applyList(rawList: string | Array<string>, appliedListRef: string): boolean {
        var hasAnyChanged = false;
        var appliedList: Array<string> = this[appliedListRef];

        if (rawList == null) {
            if (appliedList.length !== 0) {
                this[appliedListRef] = [];
                hasAnyChanged = true;
            }
        }
        else if (typeof rawList === 'string') {
            if (appliedList.length !== 1 && rawList !== appliedList[0]) {
                this[appliedListRef] = [<string>rawList];
                hasAnyChanged = true;
            }
        }
        else if (rawList instanceof Array) {
            var newList = [];
            if (utils.some(rawList, (element, index) => {
                if (typeof element === 'string') {
                    if (!hasAnyChanged) {
                        hasAnyChanged = element !== appliedList[index];
                    }
                    newList.push(element);
                    return false;
                }
                // TODO:: warning
                return true;
            })) {
                hasAnyChanged = false;
            }
            else if (hasAnyChanged || newList.length !== appliedList.length) {
                this[appliedListRef] = newList;
                hasAnyChanged = true;
            }
        }
        else {
            // TODO:: warning
        }

        return hasAnyChanged;
    }

    private copySelect(selection: any): any {
        if (typeof selection === 'object' && selection != null) {
            if (selection instanceof AggregateFunction) {
                return selection.toString();
            }
            else if (selection.clone instanceof Function) {
                return selection.clone();
            }
            else if (selection instanceof Array) {
                return utils.reduce(selection, (acc, val) => {
                    acc.push(this.copySelect(val));
                    return acc;
                }, []);
            }
            else {
                return utils.reduce(selection, (acc, val, prop) => {
                    acc[prop] = this.copySelect(val);
                    return acc;
                }, {});
            }
        }
        
        return selection;
    }

    protected applyDistinct(apply: boolean = false): boolean {
        var newVal = apply ? true : false;
        if (this._distinct == newVal) {
            return false;
        }
        this._distinct = newVal;
        return true;
    }

    protected applyFilter(rawFilter: string): boolean {
        if (this._filter !== rawFilter) {
            this._filter = rawFilter;
            return true;
        }
        return false;
    }

    protected copyTo(copy: BaseQuery<T>): void {
        copy.orderBy(this._orderBy)
            .filter(this._filter)
            .distinct(this._distinct);
    }
}
