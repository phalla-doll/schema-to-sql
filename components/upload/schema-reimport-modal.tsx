'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { expansionStore } from '@/lib/schema/expansion-store';
import { schemaStore } from '@/lib/schema/store';
import type { DatabaseSchema } from '@/types';
import { SchemaUpload } from './schema-upload';

interface SchemaReimportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SchemaReimportModal({ open, onOpenChange }: SchemaReimportModalProps) {
    const handleSchemaLoaded = (schema: DatabaseSchema) => {
        schemaStore.setSchema(schema);
        expansionStore.clear();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reimport Database Schema</DialogTitle>
                </DialogHeader>
                <SchemaUpload onSchemaLoaded={handleSchemaLoaded} embedded={true} />
            </DialogContent>
        </Dialog>
    );
}
