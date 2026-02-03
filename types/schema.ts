export interface Column {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string;
    primaryKey?: boolean;
    identity?: number;
}

export interface ForeignKey {
    column: string;
    refTable: string;
    refColumn: string;
}

export interface TableIndex {
    name: string;
    columns: string[];
    include?: string[];
    unique?: boolean;
    clustered?: boolean;
}

export interface Table {
    id?: string;
    name: string;
    columns: Column[];
    foreignKeys: ForeignKey[];
    schema?: string;
    database?: string;
    defaults?: Array<{ column: string; value: string }>;
    indices?: TableIndex[];
}

export interface DatabaseSchema {
    id: string;
    format: 'sqlserver' | 'mysql' | 'dump';
    name: string;
    uploadedAt: string;
    tables: Table[];
}
