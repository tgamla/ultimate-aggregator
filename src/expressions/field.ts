import { Logger, MessageCodes } from '../common/logger';
import * as utils from '../common/utils';
import { ExpressionType } from '../constants/expressionType';
import * as REG_EXPS from '../constants/regexps';
import { AggregationParser } from '../helpers/aggregateParser';
import { Aggregate } from './aggregate';
import { Expression, IQuotes } from './expression';
import { GroupBy, Grouping } from './groupBy';

export class Field extends Expression {

    level: number;
    innerExpressions: Aggregate[];
    groupIds: string[];
    grouping: Grouping;
    hasNonAggregatedFields: boolean;

    constructor(
        logger: Logger,
        rawExpression: any,
        queryQuotes: IQuotes,
        queryExpressions: Expression[],
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

        const sibling = this.findSibling(queryExpressions);
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

    private findSibling(queryExpressions: Expression[]): Field {
        const sibling: Field = utils.find<Field>(queryExpressions, (exp) => {
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
            this.code = this.code.replace(REG_EXPS.ROW, (...args) => {
                this.hasNonAggregatedFields = true;
                return args[1] + this.parentGroupingId + '.row' + args[2];
            });
        }
    }

    private handleIndex(logger: Logger, isWithinUngroup: boolean): void {
        if (this.checkForIndex()) {
            if (!isWithinUngroup && this.parentGroupingId) {
                logger.warning(MessageCodes.INDEX_USED_IN_GROUP, this.raw);
            }
            else {
                this.hasIndex = true;
            }
        }
    }
}
