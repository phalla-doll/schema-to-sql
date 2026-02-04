'use client';

const EXPANSION_KEY = 'schema-to-sql:table-expansion';

export interface ExpansionState {
    [tableId: string]: boolean;
}

export const expansionStore = {
    getState(): ExpansionState {
        if (typeof window === 'undefined') return {};
        const data = localStorage.getItem(EXPANSION_KEY);
        if (!data) return {};
        try {
            return JSON.parse(data);
        } catch {
            return {};
        }
    },

    setExpanded(tableId: string, isExpanded: boolean): void {
        if (typeof window === 'undefined') return;
        const state = this.getState();
        state[tableId] = isExpanded;
        localStorage.setItem(EXPANSION_KEY, JSON.stringify(state));
    },

    setAllExpanded(tableIds: string[], isExpanded: boolean): void {
        if (typeof window === 'undefined') return;
        const state: ExpansionState = {};
        tableIds.forEach((id) => {
            state[id] = isExpanded;
        });
        localStorage.setItem(EXPANSION_KEY, JSON.stringify(state));
    },

    clear(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(EXPANSION_KEY);
    },
};
