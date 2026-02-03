# Schema-to-SQL AI - Build Plan

## 📋 Overview

This document contains the complete implementation plan for the Schema-to-SQL AI application, designed to turn database schema dumps into natural-language SQL queries using AI.

---

## 🎯 Final Technical Decisions (Locked In)

| Aspect | Decision |
|--------|----------|
| **AI Provider** | OpenRouter via AI SDK |
| **Default Model** | `openrouter/free` (user can change) |
| **Schema Formats** | SQL Server + MySQL |
| **SQL Dialect** | Auto-detect from schema format |
| **Storage** | localStorage (no size limit for MVP) |
| **Chat History** | Persist across sessions via localStorage |
| **Syntax Highlighting** | Shiki for SQL code blocks |
| **Dataset Folder** | `.local.dataset/` (user-added schemas) |
| **Upload Size Limit** | Max localStorage capacity (no artificial limit) |

---

## 📁 Final File Structure

```
/app
  /api
    /schema
      /upload/route.ts
    /query
      /generate/route.ts
  /local.dataset                   # User folder (add to .gitignore)
    example-sqlserver.sql
    example-mysql.sql
  globals.css
  layout.tsx
  page.tsx

/components
  /schema
    schema-tree.tsx
    schema-search.tsx
    schema-stats.tsx
  /chat
    chat-container.tsx
    chat-input.tsx
    message-bubble.tsx
    sql-output.tsx
    model-selector.tsx
  /upload
    schema-upload.tsx

/lib
  /ai
    promptBuilder.ts
    sqlGenerator.ts
    model-selector.ts
    sqlValidator.ts
  /schema
    parser.ts
    parser-sqlserver.ts
    parser-mysql.ts
    normalizer.ts
    matcher.ts
    store.ts
    hooks.ts

/types
  index.ts
  schema.ts
  query.ts

.env.local.template
.gitignore                          # Add /.local.dataset
```

---

## 📋 Implementation Tasks (27 Tasks)

### Phase 1.1: Foundation (5 tasks)

#### Task 1.1.1: Create `/types/schema.ts`

Core schema types for the entire application.

```typescript
interface Column {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
}

interface ForeignKey {
  column: string;
  refTable: string;
  refColumn: string;
}

interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
}

interface DatabaseSchema {
  id: string;
  format: 'sqlserver' | 'mysql';
  name: string;
  uploadedAt: string;
  tables: Table[];
}
```

#### Task 1.1.2: Create `/types/query.ts`

Query and chat-related types.

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  timestamp: string;
}

interface QueryRequest {
  query: string;
  schemaId: string;
  model?: string;
}

interface QueryResponse {
  sql: string;
  explanation?: string;
  usedTables: string[];
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
}
```

#### Task 1.1.3: Create `/types/index.ts`

Barrel export for all types.

```typescript
export type * from './schema';
export type * from './query';
```

#### Task 1.1.4: Create `/lib/schema/store.ts`

localStorage management for schema, chat history, and preferences.

```typescript
const SCHEMA_KEY = 'schema-to-sql:uploaded-schema';
const CHAT_KEY = 'schema-to-sql:chat-history';
const PREFS_KEY = 'schema-to-sql:preferences';

export const schemaStore = {
  getSchema(): DatabaseSchema | null
  setSchema(schema: DatabaseSchema): void
  clearSchema(): void
}

export const chatStore = {
  getHistory(): Message[]
  addMessage(message: Message): void
  clearHistory(): void
}

export const prefsStore = {
  getPreferences(): { model: string; theme: string }
  setPreferences(prefs: Partial<{ model: string; theme: string }>): void
}
```

#### Task 1.1.5: Create `/lib/schema/hooks.ts`

React hooks for schema, chat, and preferences management.

```typescript
export function useSchema() {
  // Returns { schema, isLoading, error }
}

export function useSchemaActions() {
  // Returns { uploadSchema, clearSchema }
}

export function useChatHistory() {
  // Returns { messages, addMessage, clearHistory }
}

export function usePreferences() {
  // Returns { model, setModel }
}
```

---

### Phase 1.2: Schema Parsing (5 tasks)

#### Task 1.2.1: Create `/lib/schema/parser.ts`

Base parser interface and factory function.

```typescript
interface SchemaParser {
  parse(sql: string): Table[];
  detect(sql: string): boolean;
}

export function createParser(sql: string): SchemaParser {
  // Detect format and return appropriate parser
}
```

#### Task 1.2.2: Create `/lib/schema/parser-sqlserver.ts`

SQL Server CREATE TABLE parser.

Parses:
- `CREATE TABLE [dbo].[tableName] (...)`
- Extracts columns, data types, constraints, foreign keys

#### Task 1.2.3: Create `/lib/schema/parser-mysql.ts`

MySQL CREATE TABLE parser.

Parses:
- `CREATE TABLE \`tableName\` (...)`
- Extracts columns, data types, constraints, foreign keys

#### Task 1.2.4: Create `/lib/schema/normalizer.ts`

Convert parser output to unified DatabaseSchema format.

```typescript
export function normalizeSchema(
  tables: Table[],
  format: 'sqlserver' | 'mysql',
  name: string
): DatabaseSchema
```

#### Task 1.2.5: Create `/lib/schema/matcher.ts`

Intent extraction and table/column matching.

```typescript
interface MatchedSchema {
  tables: Table[];
  usedColumns: Map<string, string[]>; // table → columns
}

export function matchSchema(
  query: string,
  schema: DatabaseSchema
): MatchedSchema
```

---

### Phase 1.3: AI Integration (4 tasks)

#### Task 1.3.1: Create `/lib/ai/model-selector.ts`

Available models list and utilities.

```typescript
export const AVAILABLE_MODELS: ModelInfo[] = [
  { id: 'openrouter/free', name: 'Free', provider: 'OpenRouter', isFree: true },
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI', isFree: false },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', isFree: false },
  { id: 'meta-llama/llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', isFree: true },
];

export function getModelById(id: string): ModelInfo | undefined
export function getDefaultModel(): string
```

#### Task 1.3.2: Create `/lib/ai/promptBuilder.ts`

RAG prompt builder with schema context.

```typescript
interface PromptContext {
  query: string;
  schema: MatchedSchema;
  dialect: 'sqlserver' | 'mysql';
  model: string;
}

export function buildPrompt(context: PromptContext): {
  system: string;
  user: string;
}

// Example output:
// System: "Generate SQL using only provided schema. Dialect: {dialect}"
// User: "{schemaJSON}\n\nQuery: {userQuery}"
```

#### Task 1.3.3: Create `/lib/ai/sqlGenerator.ts`

AI SDK + OpenRouter integration.

```typescript
import { generateText } from 'ai';

export async function generateSQL(
  context: PromptContext,
  apiKey: string
): Promise<{ sql: string; explanation?: string }>
```

#### Task 1.3.4: Create `/lib/ai/sqlValidator.ts`

Validate SQL against schema.

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateSQL(
  sql: string,
  schema: DatabaseSchema,
  usedTables: string[]
): ValidationResult

// Checks:
// - All tables exist in schema
// - All columns exist in tables
// - No destructive operations (SELECT only)
```

---

### Phase 1.4: API Routes (2 tasks)

#### Task 1.4.1: Create `/app/api/schema/upload/route.ts`

POST endpoint for schema upload.

**Input:** FormData with file

**Output:** `{ schema: DatabaseSchema }`

**Process:**
1. Read file content
2. Detect format (SQL Server or MySQL)
3. Parse schema
4. Normalize
5. Return schema for client-side storage

#### Task 1.4.2: Create `/app/api/query/generate/route.ts`

POST endpoint for SQL generation.

**Input:** `{ query: string, schema: DatabaseSchema, model?: string }`

**Output:** `{ sql: string, usedTables: string[] }`

**Process:**
1. Match relevant tables/columns
2. Build prompt
3. Call OpenRouter via AI SDK
4. Validate SQL
5. Return result

---

### Phase 1.5: UI Components - Upload (2 tasks)

#### Task 1.5.1: Create `/components/upload/schema-upload.tsx`

Schema upload component.

**Features:**
- Drag & drop zone
- File input button
- Format detection badge (SQL Server/MySQL)
- Import from .local.dataset dropdown
- Loading state during parsing
- Error display

#### Task 1.5.2: Create `/components/schema/schema-stats.tsx`

Schema statistics display.

**Shows:**
- Table count
- Total column count
- Schema format (SQL Server/MySQL)
- Upload date

---

### Phase 1.6: UI Components - Schema Viewer (2 tasks)

#### Task 1.6.1: Create `/components/schema/schema-tree.tsx`

Hierarchical tree view using shadcn/ui Accordion.

**Features:**
- Expandable tables
- Column list with types
- Foreign key indicators
- Expand All / Collapse All buttons
- Copy table/column name on click
- Highlight matched tables/columns (from search)

#### Task 1.6.2: Create `/components/schema/schema-search.tsx`

Search/filter input.

**Features:**
- Real-time filtering (debounce 300ms)
- Highlight matching tables/columns
- Keyboard shortcut: Cmd+K
- Clear button

---

### Phase 1.7: UI Components - Chat (5 tasks)

#### Task 1.7.1: Create `/components/chat/model-selector.tsx`

Model selection dropdown.

**Features:**
- List of available models
- Free model badges
- Save preference to localStorage
- Default: openrouter/free

#### Task 1.7.2: Create `/components/chat/chat-input.tsx`

Chat input component.

**Features:**
- Auto-resizing textarea
- Send button (disabled when empty/loading)
- Model selector integration
- Clear history button
- Submit on Cmd+Enter

#### Task 1.7.3: Create `/components/chat/message-bubble.tsx`

Individual message display.

**Features:**
- User: Left-aligned, primary background
- AI: Right-aligned, muted background
- Timestamp
- Copy button
- SQL display (via sql-output component)

#### Task 1.7.4: Create `/components/chat/sql-output.tsx`

SQL code block with Shiki highlighting.

**Features:**
- Syntax highlighting (Shiki)
- SQL dialect badge
- Copy button
- Table/column hover tooltips
- Responsive width

#### Task 1.7.5: Create `/components/chat/chat-container.tsx`

Chat message list.

**Features:**
- Scrollable message list
- Auto-scroll to latest message
- Loading spinner during generation
- Empty state prompt

---

### Phase 1.8: Main Page (2 tasks)

#### Task 1.8.1: Update `/app/layout.tsx`

Add ThemeProvider for dark/light mode.

Update metadata:
- title: 'Schema-to-SQL AI'
- description: 'Turn database schema dumps into SQL queries using AI'

#### Task 1.8.2: Update `/app/page.tsx`

Main page with dual-panel layout.

**State management:**
- `uploadedSchema`: DatabaseSchema | null
- `showUpload`: boolean
- `messages`: Message[]
- `model`: string
- `searchQuery`: string

**Layout:**
- If no schema: Show upload page
- If schema: Show dual-panel (Schema Viewer | Chat Interface)

---

### Phase 1.9: Configuration (3 tasks)

#### Task 1.9.1: Create `.env.local.template`

```bash
# OpenRouter API Key (user provides)
OPENROUTER_API_KEY=your_api_key_here
```

#### Task 1.9.2: Update `.gitignore`

```gitignore
# Add to existing .gitignore:
.local.dataset/
.env.local
```

#### Task 1.9.3: Add package dependencies

```bash
# Install required packages:
npm install ai shiki
```

---

## 📊 localStorage Key Structure

```typescript
// schema-to-sql:uploaded-schema
{
  "id": "uuid",
  "format": "sqlserver" | "mysql",
  "name": "string",
  "uploadedAt": "ISO-8601",
  "tables": Table[]
}

// schema-to-sql:chat-history
{
  "messages": Message[]
}

// schema-to-sql:preferences
{
  "model": "openrouter/free",
  "theme": "light"
}
```

---

## 🎨 Component Dependencies

```
page.tsx
  ├─ schema-upload.tsx
  │   └─ schema-stats.tsx
  │
  └─ [Main Interface]
      ├─ schema-search.tsx
      ├─ schema-tree.tsx
      │   └─ schema-stats.tsx
      │
      └─ chat-container.tsx
          ├─ message-bubble.tsx
          │   └─ sql-output.tsx
          │       └─ shiki (highlighting)
          │
          └─ chat-input.tsx
              └─ model-selector.tsx
```

---

## 🔧 Technical Stack Updates

### New Dependencies to Add

```json
{
  "dependencies": {
    "ai": "^4.x.x",        // AI SDK for OpenRouter
    "shiki": "^1.x.x"      // Syntax highlighting
  }
}
```

---

## 🧪 Testing Strategy

### Manual Testing Checklist

#### Schema Upload
- [ ] Upload SQL Server schema (.sql file)
- [ ] Upload MySQL schema (.sql file)
- [ ] Import from .local.dataset
- [ ] Drag & drop works
- [ ] Error handling for invalid SQL

#### Schema Viewer
- [ ] Tree displays correctly
- [ ] Expand/Collapse works
- [ ] Search filters tables/columns
- [ ] Copy to clipboard works
- [ ] Schema stats display

#### Chat Interface
- [ ] Send query generates SQL
- [ ] SQL syntax highlighting works
- [ ] Copy SQL works
- [ ] Model selector changes model
- [ ] Chat history persists

#### AI Generation
- [ ] Default model (openrouter/free) works
- [ ] Custom model selection works
- [ ] SQL uses correct dialect
- [ ] Invalid queries get feedback
- [ ] Schema-safe (no hallucinated tables)

---

## ⚠️ Potential Issues & Solutions

| Issue | Solution |
|-------|----------|
| localStorage quota exceeded | Graceful error message + suggest cloud upload (future) |
| Shiki bundle size (~50KB) | Use dynamic import for SQL highlighter only |
| Large schemas slow down parsing | Add loading spinner + chunked parsing |
| AI model unavailable | Fallback to next available model or error message |
| Complex queries time out | Set 60s timeout + suggest simplifying query |

---

## 📝 Summary

**Total Tasks:** 27
**Estimated Time:** 6-8 hours
**Phases:** 9 phases
**New Files:** 27 files
**Modified Files:** 3 files (layout.tsx, page.tsx, .gitignore)

---

## 🚀 Execution Order

The tasks should be executed in this order:

1. **Phase 1.1:** Foundation (Types + Storage + Hooks)
2. **Phase 1.2:** Schema Parsing (Parsers + Normalizer + Matcher)
3. **Phase 1.3:** AI Integration (Models + Prompt Builder + Generator + Validator)
4. **Phase 1.4:** API Routes (Upload + Generate)
5. **Phase 1.5:** Upload Components (Schema Upload + Stats)
6. **Phase 1.6:** Schema Viewer Components (Tree + Search)
7. **Phase 1.7:** Chat Components (Model Selector + Input + Message + SQL + Container)
8. **Phase 1.8:** Main Page (Layout + Page)
9. **Phase 1.9:** Configuration (Env template + Gitignore + Dependencies)

---

## ✅ Ready for Execution

All decisions are locked in. The plan is comprehensive and ready to implement.

---

*Last Updated: 2026-02-03*
