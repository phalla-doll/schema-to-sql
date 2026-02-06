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
            <div className="rounded-sm bg-gray-100 px-4 py-3 text-center text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                No schema loaded yet
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 rounded-sm border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
            {tableCount > 0 && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Tables
                    </span>
                    <span className="text-xs font-semibold text-black dark:text-white">
                        {tableCount}
                    </span>
                </div>
            )}
            {viewCount > 0 && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Views
                    </span>
                    <span className="text-xs font-semibold text-black dark:text-white">
                        {viewCount}
                    </span>
                </div>
            )}
            {procedureCount > 0 && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Procedures
                    </span>
                    <span className="text-xs font-semibold text-black dark:text-white">
                        {procedureCount}
                    </span>
                </div>
            )}
            {columnCount > 0 && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Columns
                    </span>
                    <span className="text-xs font-semibold text-black dark:text-white">
                        {columnCount}
                    </span>
                </div>
            )}
            {format && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Format
                    </span>
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        {format}
                    </span>
                </div>
            )}
            {uploadedAt && (
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Uploaded
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(uploadedAt).toLocaleDateString()}
                    </span>
                </div>
            )}
        </div>
    );
}
