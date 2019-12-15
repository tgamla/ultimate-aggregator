import * as utils from "../common/utils";
import { Logger, MessageCodes } from '../common/logger';
import { Expression, ExpressionRegExps, Type as ExpressionType, Quotes } from '../prototypes/expression';
import { GroupBy, Grouping } from './groupBy';
import { Aggregate } from './aggregate';
import { AggregationParser } from '../helpers/aggregateParser';


export class Field extends Expression {
    
    public level: number;
    public innerExpressions: Array<Aggregate>;
    public groupIds: Array<string>;
    public grouping: Grouping;
    public hasNonAggregatedFields: boolean;
    public isWithinUngroup: boolean;

    constructor(
        logger: Logger,
        rawExpression: any,
        queryQuotes: Quotes,
        queryExpressions: Array<Expression>,
        groupId: string = null,
        grouping: Grouping = [],
        isWithinUngroup: boolean = false,
        level: number = 0
    ) {
        super(ExpressionType.FIELD, rawExpression, queryQuotes, GroupBy.getLastGroupingId(grouping));
        this.level = level;
        this.grouping = utils.copy(grouping);
        this.addGroupId(groupId);
        this.normalize();
        
        var sibling = this.findSibling(queryExpressions);
        if (sibling) {
            return sibling;
        }

        this.hasNonAggregatedFields = false;
        this.innerExpressions = new Array<Aggregate>();

        AggregationParser.parse(<any>this, logger, queryExpressions, queryQuotes, grouping, groupId, isWithinUngroup);
        this.validate();
        this.handleGroupIndex();
        this.handleNonAggrFields();
        this.handleIndex(logger, isWithinUngroup);

        queryExpressions.push(this);
    }

    // =========================================================================================================
    // ============================================ PRIVATE METHODS ============================================
    // =========================================================================================================

    private findSibling(queryExpressions: Array<Expression>): Field {
        var sibling: Field = utils.find<Field>(queryExpressions, (exp) => {
            return this.equals(exp) && GroupBy.compareGrouping(this.grouping, exp.grouping);
        });

        if (sibling) {
            if (this.level > sibling.level) {
                sibling.level = this.level;
            }
            sibling.addGroupId(this.groupIds[0]);
        }

        return sibling;
    }

    private handleNonAggrFields(): void {
        if (this.parentGroupingId && !this.level) {
            this.code = this.code.replace(ExpressionRegExps.ROW, (...args) => {
                this.hasNonAggregatedFields = true;
                return args[1] + this.parentGroupingId + '.row' + args[2]
            });
        }
    }

    private handleIndex(logger: Logger, isWithinUngroup: boolean): void {
        if (this.checkIndex()) {
            if (!isWithinUngroup && this.parentGroupingId) {
                logger.warning(MessageCodes.INDEX_USED_IN_GROUP, this.raw);
            }
            else {
                this.hasIndex = true;
            }
        }
    }
}
