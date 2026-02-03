# Schema-to-SQL AI

Turn **database schema dumps** into **natural-language SQL queries** using AI.

Upload your database schema catalog, ask questions in plain English, and get **safe, schema-aware SQL** you can run immediately.

---

## 🚀 What This Project Does

This web app allows users to:

1. Upload a **database schema catalog dump** (SQL Server / Azure SQL supported first)
2. Visualize the schema in a **clean, navigable tree**
3. Ask questions like:
   > "Get all flight numbers from the last 2 weeks"
4. Receive:
   - Valid SQL queries
   - Generated **only from the uploaded schema**
   - With zero database access required

The AI never touches your database — it only reasons over your schema.

---

## ✨ Key Features

- 📂 Schema upload (catalog dump)
- 🌳 Interactive schema explorer
- 🧠 Natural language → SQL generation
- 🔒 Schema-safe AI (no hallucinated tables/columns)
- 🧾 SQL Server / Azure SQL dialect support
- 🧩 Foreign-key–aware joins
- 🧪 Query validation before output

---

## 🏗️ Architecture Overview

```
User Input (English)
        ↓
Intent Extraction
        ↓
Relevant Table Detection
        ↓
Schema Subset Selection
        ↓
AI SQL Generation
        ↓
Static Validation
        ↓
Final SQL Output
```

---

## 🧠 How the AI Works (Important)

This project **does NOT fine-tune a model**.

Instead, it uses a **RAG-style prompting strategy**:

- The uploaded schema is parsed into structured JSON
- Only *relevant tables and columns* are injected into the prompt
- The AI is strictly instructed to:
  - Use only provided schema
  - Ask for clarification if ambiguous
  - Output SQL only (no explanations unless requested)

This makes the system:
- Safer
- Cheaper
- Easier to maintain

---

## 🧩 Supported Use Cases

- Legacy databases with hundreds of tables
- Non-SQL users (PMs, analysts, ops)
- Onboarding new engineers
- Exploring unfamiliar schemas
- Generating safe ad-hoc queries

---

## 🛠️ Tech Stack

### Frontend
- **Next.js (App Router)**
- TypeScript
- Tailwind CSS
- Schema Tree Viewer (custom or Radix)
- Monaco Editor (SQL preview)

### Backend
- Next.js API Routes / Server Actions
- Schema parser (custom)
- JSON-based schema store

### AI
- OpenAI / Anthropic / compatible LLM
- Prompt-based RAG (no fine-tuning)

---

## 🎨 UI/Layout Design

The interface follows a ChatGPT-inspired layout with a clean, dual-panel design:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │      SCHEMA VIEWER              │  │      CHAT INTERFACE          │ │
│  │                                 │  │                               │ │
│  │  ┌───────────────────────────┐ │  │  ┌─────────────────────────┐ │ │
│  │  │ 🔍 Search tables...       │ │  │  │ User:                   │ │ │
│  │  ├───────────────────────────┤ │  │  │ "Get all flight numbers │ │ │
│  │  │ ▼ t_batch                 │ │  │  │  from the last 2 weeks" │ │ │
│  │  │   ├─ flightNumber         │ │  │  └─────────────────────────┘ │ │
│  │  │   ├─ flightDateTime       │ │  │  ┌─────────────────────────┐ │ │
│  │  │   └─ flightStatus         │ │  │  │ AI:                     │ │ │
│  │  │ ▼ t_customer              │ │  │  │ SELECT DISTINCT          │ │ │
│  │  │   ├─ customerId           │ │  │  │   flightNumber          │ │ │
│  │  │   ├─ customerName         │ │  │  │ FROM t_batch            │ │ │
│  │  │   └─ customerEmail        │ │  │  │ WHERE flightDateTime    │ │ │
│  │  │ ▶ t_booking               │ │  │  │   >= DATEADD(day, -14,  │ │ │
│  │  │ ▶ t_aircraft              │ │  │  │       GETDATE());      │ │ │
│  │  │ ...                       │ │  │  └─────────────────────────┘ │ │
│  │  ├───────────────────────────┤ │  │                               │ │
│  │  │ [▼ Expand All] [▲ Collapse]│ │  │  ┌─────────────────────────┐ │ │
│  │  │     [Copy Selected]        │ │  │  │ User:                   │ │ │
│  │  └───────────────────────────┘ │  │  │ [Type your query...]     │ │ │
│  │                                 │  │  └─────────────────────────┘ │ │
│  │ [Schema Stats: 5 tables]       │  │                               │ │
│  └─────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Panel Descriptions

**Schema Viewer Panel (Left)**
- Hierarchical tree view of database tables and columns
- Search/filter functionality for quick navigation
- Click to expand/collapse individual tables
- Bulk controls: "Expand All" / "Collapse All"
- Copy selected table/column names to clipboard
- Schema statistics display (table count, etc.)

**Chat Interface Panel (Right)**
- ChatGPT-style conversation interface
- User messages aligned left, AI responses aligned right
- AI responses include:
  - Generated SQL queries with syntax highlighting
  - Brief explanations (when requested)
- Input box at bottom for natural language queries
- Conversation history with scrollable view
- Copy SQL button on generated queries

### Expand/Collapse Behavior

- **Individual Tables**: Click triangle icon (▶/▼) to toggle
- **Bulk Actions**: 
  - "Expand All" - Opens all tables showing all columns
  - "Collapse All" - Closes all tables to show only names
- **Persistent State**: Panel state saved between sessions
- **Responsive**: On smaller screens, panels stack vertically
- **Split Control**: Drag handle between panels to resize (optional)

### Layout Features

- Clean, minimal design focused on usability
- Dark/light mode support
- Keyboard shortcuts (e.g., Cmd+K for search)
- Mobile-responsive with collapsible schema panel
- Syntax highlighting for SQL output
- Copy-to-clipboard for easy query extraction

---

## 📁 Project Structure (Proposed)

```
/app
  /upload
  /schema
  /query
  /history

/lib
  ai/
    promptBuilder.ts
    sqlValidator.ts
  schema/
    parser.ts
    normalizer.ts
    matcher.ts

/api
  upload-schema
  generate-sql

/types
  schema.ts
  query.ts
```

---

## 📄 Example Workflow

### User Input
```
I want all flight numbers between the last 2 weeks
```

### Detected Schema
- Table: `t_batch`
- Columns:
  - `flightNumber`
  - `flightDateTime`

### Generated SQL
```sql
SELECT DISTINCT flightNumber
FROM t_batch
WHERE flightDateTime >= DATEADD(day, -14, GETDATE())
  AND flightNumber IS NOT NULL;
```

---

## 🧪 Query Safety Rules

The AI is constrained by:

- ❌ No unknown tables
- ❌ No guessed columns
- ❌ No destructive queries (DROP, DELETE, UPDATE by default)
- ✅ SELECT-only for MVP
- ✅ SQL Server–compatible syntax

---

## 🗺️ Roadmap

### Phase 1 (MVP)
- Schema upload
- Schema viewer
- Natural language → SELECT SQL

### Phase 2
- JOINs & aggregates
- Query explanation
- Ambiguity resolution

### Phase 3
- Multi-database support
- Query optimization hints
- Saved prompts & history
- Role-based access

---

## 🔐 Security Considerations

- No database credentials required
- No query execution on server
- Schema data isolated per user/project
- Prompt injection mitigation via strict templates

---

## 🧠 Limitations (By Design)

- Does not execute SQL
- Requires reasonably clean schema dumps
- Ambiguous language may require clarification

---

## 🤝 Contribution

PRs are welcome!

Ideas to contribute:
- New schema parsers
- Better intent detection
- More SQL dialects
- Visualization improvements

---

## 📜 License

MIT License

---

## 📌 Vision

> **Databases shouldn’t be locked behind SQL fluency.**

This project aims to make complex schemas understandable and queryable by anyone — safely, transparently, and intelligently.

---

If you plan to open-source this, this README is already structured for GitHub.
If you want, I can:
- Add badges
- Make a SaaS version README
- Write pitch copy for landing page
- Generate API docs

Just say the word 🚀
