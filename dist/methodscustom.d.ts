export declare function parallel(commands: any, numConnections?: number): Promise<any[]>;
export declare function parallel_items(items: any, operations: any, numConnections?: number): Promise<any>;
export declare function FindProps(items: (number | {
    id: number;
    [key: string]: any;
})[], operations: Function[], keys?: string[], numConnections?: number): Promise<Array<{
    id: number;
    [key: string]: any;
}>>;
export declare function Find(options: any): Promise<any>;
