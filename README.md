# Ultimate-Aggregator
Ultimate-aggregator is javascript query builder for modeling and aggregating data in SQL fashion, focused on performance of queries exceution. Works well in both; modeling multi-dimension presentation data in front-end so as supporting dataminig in NO-SQL solutions in back-end.
Distribution: UMD, ES5, ISC license.

## Constructors

### Query

**Construtor(config?: IConfig): Query**

Creates new instance of Query.
For more information about config please go to "config" function section.

**preFilter(filter: string): Query**

Filters input data by filter expression.

**select(selection: any): Query**

Defines composition being used to create results.
Select accepts Group, Ungroup object instances, expressions with aggregate functions (functional notation is also possible).

**distinct(apply: boolean): Query**

Defines if Query result values can repeat.
For now works only on primitive values.

**config(config: IConfig): Query**

Defines Query configuration.
Config:
| Property Name | Description |
| ---- | ---- |
| queryName: string | defines name under which all logs from Query will be printed (Default: Query id) |
| logLevel: number | 1 - prints all errors, 2 - prints all warnings, 3 - prints all logs (Default: 2) |
| throwingErrorsLevel: number | 1 - throws error on any error, 2 - throws error on any warning, 3 - throws error on any log (Default: 0) |
| debugLevel: number | 1 - prints input/output data, 2 - prints query, expressions, query code, preprocessed data (Default: 0) |
| debugObjectToJSON: boolean | defines if debugged object shall be stringified before printing in logs (Default: false) |



**addContext(reference: Object | Function | string, value?: any): Query**

Add element by reference name to context, so that expressions (except of preFilter) can use it.
If reference is an object then all properties values are being added with property name as reference.
If reference is a function then function name is used as reference.
Examples:
```javascript
new ua.Query()
    .select('currencyFormat(row)')
    .addContext('currencyFormat', function(val) { return val.toFixed(2) + ' USD'; })
```
```javascript
new ua.Query()
    .select('currencyFormat(row)')
    .addContext(function currencyFormat(val) { return val.toFixed(2) + ' USD'; })
```
Both examples works in exact same way.

**removeContext(reference: string | Object): Query**

Removes element reference from context. If object being passed then all references with property names defined in object will be removed from context.

**from(dataSet?: Array<any> | Object | Query): Query**

Defines Query datasource.

**groupBy(grouping?: string | Array<string>): Query**

Defines Query results granularity. Granularity will be defined based on values returned by expression (values will be converted to string and compared as such). If no grouping has been defined then Query grouping can be highest or lowest possible data level granularity. If query has at least one of the following; group (with grouping), ungroup, primal aggregation** (without OVER) in selection, then data granularity is lowest, otherwise highest applies.
** Primal aggregation is aggregation associated directly to field expression. In other words it is non inner aggregation e.g. CONCAT is primal aggregation whereas SUM is not;
```javascript
new ua.Query()
    .select('CONCAT(row.amount / SUM(row.amount))')
```

**filter(filter?: string): Query**
Defines filter expression, by which output data will be filtered.

**orderBy(sorting?: Array<string> | string): Query**
Defines Query output results order based on expressions. Each expression should return primitive value. ASC/DESC directive can be used at the beginning of each expression to determine order direction (default is ASC). Empty expression will sort by value ("VALUE" syntax can be used as replacement just to underline meaning). "out" is access variable to output data.
Example:
```javascript
new ua.Query()
    .select({
        region: 'row.departmentRegion',
        amount: 'row.invoiceAmount'
    })
    .orderBy(['out.region', 'DESC out.amount'])
```

**toList(): Array<any>**

Executes Query based on current definition and returns Array of element as results. Each element structure is defined with "select" function.

**execute(datasource?: Array<any> | Object | Query): any**

Executes Query and returns result based on current definition. Additionaly datasource can be passed to execute. If current defnition datasource is sub-Query then executable datasource is being passed to such sub-Query to execute. Default output results type is Array.

---
### Group
Creates additional dimension within outer scope selection, inherits outer scope grouping and increases its data granularity.

**constructor(selection: any): Group**

Defines composition being used to create results.
Such selection accepts Group, Ungroup object instances, expressions with aggregate functions (functional notation is also possible).

**distinct(apply?: boolean): Group**

Defines if output values can repeat.
For now works only on primitive values.

**by(grouping?: string | Array<string>): Group**

Defines Group results granularity (inherits at the same time outer scope selection grouping). Granularity will be defined based on values returned by expressions (values will be converted to string and compared as such).

**filter(filter?: string): Group;**

Defines filter expression, by which output data will be filtered.

**orderBy(sorting?: string | Array<string>): Group**

Defines Group output results order with expressions. Each expression should return primitive value. ASC/DESC directive can be used at the beginning of each expression to determine order direction (default is ASC). Empty expression will sort by value ("VALUE" syntax can be used as replacement just to underline meaning). “out” is access variable to output data.

---
### Ungroup
Creates additional dimension within outer scope selection, with highest data granularity. Also inherits outer scope grouping.

**Constructor(selection: any): Ungroup**

Defines composition being used to create results.
Such selection accepts expressions with aggregate functions (functional notation is also possible), yet only with OVER directive.

**distinct(apply?: boolean): Ungroup**

Defines if output values can repeat.
For now works only on primitive values.

**filter(filter?: string): Ungroup**

Defines filter expression, by which output data will be filtered.

**orderBy(sorting?: string | Array<string>): Ungroup**

Defines Ungroup output results order with expressions. Each expression should return primitive value. ASC/DESC directive can be used at the beginning of each expression to determine order direction (default is ASC). Empty expression will sort by value ("VALUE" syntax can be used as replacement just to underline meaning). “out” is access variable to output data.

---
### AggregateFunction
Is a form of expression to manipulate grouped data, same as literal notation of aggregations within string expressions (more in section: "Aggregations").

**constructor(type: AggregateFunctionType, rawExpression: any, argExpression?: string)**

Create new instance of aggregate function, which can be used as expression in selection.
Example:
```javascript
var get3rdElem = new ua.AggregateFunction(ua.AggregateFunctionType.NTH, 'row', '3');
var results = new ua.Query()
	.select(get3rdElem)
	.from([1, 2, 3, 4, 5])
    .toList();
// results: [ 3 ]
```

NOTICE!: Along with AggregateFunction constructor comes functions defined directly within module itself, which represents variation of each possible aggregate function type; count, sum, avg, min, max, first, last, nth, concat.
Example:
```javascript
new ua.Query()
    .select(ua.concat('row', '"|"').over([]).orderBy('DESC').distinct(true))
```

---
## Expressions
Expression is a string used in specific functions. Such string can consist of any executable javascript code that returns value and can be used for assigning to variable.
All following names are restricted within expressions;
\__{name}__ - reserved for internal query processing variables.
data - input dataset.
prop - dataset property name used for iteration.
row - dataset property value used for iteration.
index - number of iteration over dataset properties.
groupIndex - number of iteration within grouped dataset properties.
out - each output data value used for post processing iteration.

**Field Expression(used in: Query select, Group/Ungroup constructor)**

Field expression is string being used (as a whole) within selection.
Such expression can consist of Aggregate Functions.
Can refer to data, row.
Additionaly can refer to: prop, index, groupIndex, if used within Ungroup.
If groupig applies to selection with field expression that refers to non aggregated row, then last row within group should be taken.

**Aggregate Expression(used in: Query select, Group/Ungroup constructor, count, sum, avg, min, max, first, last, nth, concat)**

Such expression can consist of Aggregate Functions.
Can refer to; data, row, prop, index, groupIndex.
Aggregate function directives (OVER/over, ORDER_BY/orderBy) can refer to same variables.

**PreFilter(used in: Query preFilter)**

Can refer to; data, prop, row.

**Filter(used in: Query/Group/Ungroup filter)**

Can refer to; out.
Additionaly can refer to: data, prop, row, if used within Ungroup.

**GroupBy(used in: Query groupBy, Group by)**

Can refer to; data, prop, row.

**OrderBy(used in: Query/Group/Ungroup orderBy)**

Can refer to; out.

---
## Aggregations
#### COUNT
Returns number of rows for given grouping granularity. If no expression (or one of following; *, ALL, true) is defined then it will count by all rows. Only non null and non undefined values are being considered.
Example:
```javascript
var results = ua.query()
    .select('COUNT(row)')
    .from([ 1, null, 2, 3 ])
    .toList();
// results: [ 3 ]
```
#### SUM
Returns sum of values returned by SUM expression for given grouping granularity. Only non null and non undefined values are being considered.
Example:
```javascript
var results = ua.query()
    .select('SUM(row)')
    .from([ 1, null, 2, 3 ])
    .toList();
// results: [ 6 ]
```

#### AVG
Returns avarage of values returned by AVG expression for given grouping granularity. Only non null and non undefined values are being considered.
Example:
```javascript
var results = ua.query()
    .select('AVG(row)')
    .from([ 1, null, 2, 3 ])
    .toList();
// results: [ 2 ]
```

#### MIN
Returns minimum value out of values returned by MIN expression for given grouping granularity. Only non null and non undefined values are being considered.
Example:
```javascript
var results = ua.query()
    .select('MIN(row)')
    .from([ 1, null, 2, 3 ])
    .toList();
// results: [ 1 ]
```

#### MAX
Returns maximum value out of values returned by MAX expression for given grouping granularity. Only non null and non undefined values are being considered.
Example:
```javascript
var results = ua.query()
    .select('MAX(row)')
    .from([ 1, null, 2, 3 ])
    .toList();
// results: [ 3 ]
```

#### FIRST
Returns first of values returned by FIRST expression for given grouping granularity.
Example:
```javascript
var results = ua.query()
    .select('FIRST(row)')
    .from([ undefined, 1, null, 2, 3 ])
    .toList();
// results: [ undefined ]
```

#### LAST
Returns last of values returned by LAST expression for given grouping granularity.
Example:
```javascript
var results = ua.query()
    .select('LAST(row)')
    .from([ undefined, 3, 2, 1 ])
    .toList();
// results: [ 1 ]
```

#### NTH
Returns "nth" of values returned by NTH expression for given grouping granularity. Second parameter within expression determines number of value that shall be returned.
Example:
```javascript
var results = ua.query()
    .select('NTH(row, 2)')
    .from([ undefined, 3, 2, 1 ])
    .toList();
// results: [ 3 ]
```

#### CONCAT
Returns concatenation of values returned by CONCAT expression for given grouping granularity. Second parameter within expression determines values delimiter. Only non null and non undefined values are being considered.
Example:
```javascript
var results = ua.query()
    .select('CONCAT(row, "|")')
    .from([ undefined, 3, 2, 1 ])
    .toList();
// results: [ "3|2|1" ]
```

#### DISTINCT
Defines if aggregated values can repeat. Such directive has to be declared as first syntax within Aggregate Function expression. All values are being stringified before comparision, wherefore works well only on primitive values. Applies only on; SUM, NTH, COUNT, AVG, CONCAT aggregations.
Example:
```javascript
var results = ua.query()
    .select('CONCAT(DISTINCT row)')
    .from([ undefined, 3, 1, 3, 1 ])
    .toList();
// results: [ "3, 1" ]
```

#### OVER
Changes aggregate expression grouping granularity level (no outer scope grouping applies). OVER directive has to follow aggregate expression. If no arguments being passed then granularity level will be lowest.
Example:
```javascript
var results = ua.query()
    .select('LAST(row)OVER()')
    .from([ undefined, 3, 2, 1 ])
    .toList();
// results: [ 1, 1, 1, 1 ]
```

#### ORDER_BY
Determines sorting of values returned by aggregate expression. ORDER_BY directive has to follow OVER directive (or aggregate expression if OVER has not been applied). Additionaly sorting direction can be modified with ASC. DESC (ASC is default) before each ORDER_BY expression parameter. if parameter is being empty then sorts by value. Applies only for; FIRST, LAST, NTH, CONCAT aggregations.
Example:
```javascript
var results = ua.query()
    .select('NTH(row, 2)ORER_BY(DESC)')
    .from([ undefined, 1, 3, 2 ])
    .toList();
// results: [ 2 ]
```

#### Inner Aggregations
Is any aggregation defined within expression of aggregate function. Such aggregation will return value per each row, not affecting output granularity.
Example:
```javascript
var results = ua.query()
    .select('CONCAT((row / SUM(row) || 0).toFixed(2))')
    .from([ undefined, 3, 2, 1 ])
    .toList();
// results: [ "0.00, 0.50, 0.33, 0.17" ]
```
SUM is inner aggregation.

---
# SECURITY
WARNING!: Every expression is being run in eval, so it is highly unrecomended passing values to expressions from unauthorized resources (without sanitizing) as it can be easy way to perform XSS or in general any js injection attack.
e.g. passing web client value to filter in a query executed in Node.js application.

---
# TIPS & TRICKS

Sorting by many values should always start from the most detailed (highest granularity), best would be just one representing uniqueness. Same for filtering, grouping.

Sorting is heavy operation so if data is already sorted (e.g. on db side), it is worth to relly on it as ultimate-aggregator is processing data sequentionally.

It is worth to remember that aggregation functions defer on speed of execution, starting from fastest:
 -FIRST/LAST/NTH/COUNT
 -MAX/MIN/SUM/AVG
 -CONCAT

Additionaly ORDER_BY and DISTINCT directives slows dow execution.

On the other hand if Field/Aggregate expressions are similar (have same grouping, sorting and expression structure) then operation will be done only once.

example:
```javascript
ua.query().select({
    region: 'row.region',
    totalAmount: 'SUM(row.invoiceAmount)',
    sellers: ua.group({
        seller: 'row.fullName',
        salesPercentage: 'SUM(row.invoiceAmount) / SUM( row ["invoiceAmount"]) OVER (row.region)'
    }).by('row.accountId')
}).groupBy('row.region')
```

In such case both; 'SUM(row.invoiceAmount)' for totalAmount, and 'SUM( row ["invoiceAmount"]) OVER (row.region)' for salesPercentage will be one an the same operation.
