'use client';

const EXPANSION_KEY = 'schema-to-sql:table-expansion';
const DEBOUNCE_DELAY = 300;

export interface ExpansionState {
    [tableId: string]: boolean;
}

let pendingState: ExpansionState | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
        const state = pendingState || this.getState();
        state[tableId] = isExpanded;
        pendingState = state;
        this.debouncedSave(state);
    },

    setAllExpanded(tableIds: string[], isExpanded: boolean): void {
        if (typeof window === 'undefined') return;
        const state: ExpansionState = {};
        tableIds.forEach((id) => {
            state[id] = isExpanded;
        });
        pendingState = state;
        localStorage.setItem(EXPANSION_KEY, JSON.stringify(state));
        this.clearDebounce();
    },

    clear(): void {
        if (typeof window === 'undefined') return;
        this.clearDebounce();
        pendingState = null;
        localStorage.removeItem(EXPANSION_KEY);
    },

    debouncedSave(state: ExpansionState): void {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            localStorage.setItem(EXPANSION_KEY, JSON.stringify(state));
            pendingState = null;
            debounceTimer = null;
        }, DEBOUNCE_DELAY);
    },

    clearDebounce(): void {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    },
};
