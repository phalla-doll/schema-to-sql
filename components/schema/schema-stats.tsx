interface SchemaStatsProps {
    tableCount: number;
    columnCount: number;
    viewCount: number;
    procedureCount: number;
    format: 'sqlserver' | 'mysql' | 'dump' | null;
    uploadedAt: string | null;
}

export function SchemaStats({
    tableCount,
    columnCount,
    viewCount,
    procedureCount,
    format,
    uploadedAt,
}: SchemaStatsProps) {
    if (tableCount === 0 && viewCount === 0 && procedureCount === 0) {
        return (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                No schema loaded yet
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
            {tableCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Tables:</span>
                    <span className="font-semibold">{tableCount}</span>
                </div>
            )}
            {viewCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Views:</span>
                    <span className="font-semibold">{viewCount}</span>
                </div>
            )}
            {procedureCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Procedures:</span>
                    <span className="font-semibold">{procedureCount}</span>
                </div>
            )}
            {columnCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Columns:</span>
                    <span className="font-semibold">{columnCount}</span>
                </div>
            )}
            {format && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Format:</span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
                        {format}
                    </span>
                </div>
            )}
            {uploadedAt && (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Uploaded:</span>
                    <span className="text-xs">{new Date(uploadedAt).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
}
