'use client';

import { useRef, useState } from 'react';
import { SchemaStats } from '@/components/schema/schema-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DatabaseSchema } from '@/types';

interface SchemaUploadProps {
    onSchemaLoaded: (schema: DatabaseSchema) => void;
}

const DATASET_FILES = [
    { name: 'database-model-dump.txt', label: 'Database Dump (Azure SQL)' },
    { name: 'example-sqlserver.sql', label: 'SQL Server Example' },
    { name: 'example-mysql.sql', label: 'MySQL Example' },
];

export function SchemaUpload({ onSchemaLoaded }: SchemaUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/schema/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await response.json();
            onSchemaLoaded(data.schema);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload schema');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleImportFromDataset = async (filename: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/.local.dataset/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to load dataset file');
            }

            const sqlContent = await response.text();

            const blob = new Blob([sqlContent], { type: 'text/plain' });
            const file = new File([blob], filename, { type: 'text/plain' });

            await handleFile(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import schema');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardContent className="p-8">
                    <div className="mb-8 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                role="img"
                                aria-label="File document icon"
                            >
                                <title>File document</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-2 text-3xl font-bold">Upload Database Schema</h1>
                        <p className="text-muted-foreground">
                            Upload a SQL Server, MySQL, or dump schema file to get started
                        </p>
                    </div>

                    {/* biome-ignore lint/a11y/noStaticElementInteractions: Valid drag-and-drop drop zone */}
                    <div
                        className={`mb-6 rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                            dragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            role="img"
                            aria-label="Upload cloud icon"
                        >
                            <title>Upload cloud</title>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="mb-2 text-lg font-medium">
                            Drag and drop your schema file here
                        </p>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Supports .sql, .txt, and .dump files
                        </p>
                        <Button onClick={handleBrowseClick} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Browse Files'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".sql,.txt,.dump"
                            className="hidden"
                            onChange={handleFileInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="mb-2 text-sm font-medium">Or try an example:</p>
                        <div className="space-y-2">
                            {DATASET_FILES.map((file) => (
                                <Button
                                    key={file.name}
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => handleImportFromDataset(file.name)}
                                    disabled={isLoading}
                                    className="w-full justify-start"
                                >
                                    {file.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <SchemaStats tableCount={0} columnCount={0} format={null} uploadedAt={null} />
                </CardContent>
            </Card>
        </div>
    );
}
