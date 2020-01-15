export declare type IIterator<T> = (val: T, prop?: string) => void;
export declare type ISomeIterator<T> = (val: T, prop?: string) => boolean;
export declare function forEach<El>(source: any, iterator: IIterator<El>): void;
export declare function forEachRecursive<El>(source: any, inner: string, iterator: IIterator<El>): void;
export declare type IAccumulator<El, Out> = (acc: Out, val: El, prop?: string) => Out;
export declare function reduce<El, Out>(source: any, iterator: IAccumulator<El, Out>, accumulator: Out): Out;
export declare type IMapIterator<El, Out> = (val: El, prop?: string) => Out;
export declare function map<InEl, OutEl>(source: any, iterator: IMapIterator<InEl, OutEl>): OutEl[];
export declare function reverseMap<InEl, OutEl>(source: any, iterator: IMapIterator<InEl, OutEl>): OutEl[];
export declare function find<El>(source: any, predicate: ISomeIterator<El>): El;
export declare type IIteratorReturnFound<T> = (val: T, prop?: string) => T;
export declare function returnFound<El>(source: any, predicate: IIteratorReturnFound<El>): El;
export declare function some<El>(source: any, predicate: ISomeIterator<El>): boolean;
export declare function deepCopy<T>(source: T): T;
export declare function copy<T>(source: any, output?: T): T;
export declare function isEmpty(val: any): boolean;
export declare function keysLength(source: any): number;
export declare function generateId(): string;
export declare function denormalizeId(id: string): string;
export declare function formatId(id: any): string;
export declare function format(text: String, ...args: string[]): string;
export declare function addIdSuffix(id: string, suffix: string): string;
export declare function encapsulate(obj: Object): void;
