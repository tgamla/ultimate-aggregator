
export interface IQueryDefinition extends IBaseQueryDefinition {
    preFilter: string;
}

export interface IBaseGroupDefinition extends IBaseQueryDefinition {
    uniformed: boolean;
}

export interface IBaseQueryDefinition {
    id: string;
    type: string;
    select: any;
    filter: string;
    distinct: boolean;
    groupBy: string[];
    orderBy: string[];
    asList: boolean;
}
