import type { Table } from '@/types';
import { DumpParser } from './parser-dump';
import { MySQLParser } from './parser-mysql';
import { SQLServerParser } from './parser-sqlserver';

export interface SchemaParser {
    parse(sql: string): Table[];
    detect(sql: string): boolean;
}

export function createParser(sql: string): SchemaParser {
    const dumpParser = new DumpParser();
    const sqlServerParser = new SQLServerParser();
    const mysqlParser = new MySQLParser();

    if (dumpParser.detect(sql)) {
        return dumpParser;
    }

    if (sqlServerParser.detect(sql)) {
        return sqlServerParser;
    }

    if (mysqlParser.detect(sql)) {
        return mysqlParser;
    }

    throw new Error(
        'Unsupported SQL format. Only SQL Server, MySQL, and Dump formats are supported.'
    );
}
