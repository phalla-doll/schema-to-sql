# Agent Guidelines for schema-to-sql

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Code Quality
- `npm run lint` - Run Biome linter
- `npm run lint:fix` - Auto-fix lint issues
- `npm run format` - Format code with Biome
- `npm run check` - Run both lint and format checks

**Note**: No test framework is configured in this project.

---

## Code Style Guidelines

### Formatting (Biome)
- Indentation: 4 spaces
- Line width: 100 characters
- Quotes: Single quotes for strings, double for JSX attributes
- Semicolons: Always required
- Trailing commas: ES5 style
- Arrow function parentheses: Always required

### TypeScript
- Strict mode enabled
- Use `import type` for type-only imports (enforced by linter)
- Type inference preferred where clear
- Avoid explicit `any` (linter warning)
- Use `Readonly` for props that shouldn't be mutated

### Imports
- Use absolute imports with `@/` alias (e.g., `@/components/ui/button`)
- Group imports: external libraries first, then internal modules
- Type-only imports must use `import type`

```typescript
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

### Component Patterns
- Use function components (no class components)
- Props destructured in function signature
- Default values provided inline
- Components use PascalCase naming
- Variants managed via class-variance-authority (cva)

```typescript
function Component({ className, variant = 'default', ...props }: Props) {
    return <div className={cn(baseClass, className)} {...props} />;
}
```

### className Management
- Use `cn()` utility from `@/lib/utils` for merging Tailwind classes
- Use `clsx` and `tailwind-merge` under the hood
- Prefer utility classes over custom CSS

### UI Components
- Built with shadcn/ui and Radix UI primitives
- Variants defined using cva
- Data attributes for component state (e.g., `data-variant`, `data-size`)
- Polymorphic components support via `asChild` pattern

### File Structure
- `/app` - Next.js app directory (routes, layouts)
- `/components` - React components
- `/components/ui` - Reusable UI primitives (shadcn/ui)
- `/lib` - Utility functions and helpers

### Naming Conventions
- Components: PascalCase (e.g., `Button`, `DataTable`)
- Functions: camelCase (e.g., `cn`, `formatDate`)
- Constants: UPPER_SNAKE_CASE (rare, typically for config)
- Types/Interfaces: PascalCase (e.g., `ComponentProps`)

### Error Handling
- No error handling patterns observed in codebase
- When adding error handling, consider:
  - Try-catch for async operations
  - Error boundaries for React components
  - User-friendly error messages

### Additional Notes
- No tests configured - consider adding test framework if needed
- ESLint replaced by Biome
- Uses Next.js 16 with App Router
- React 19 with `react-jsx` transform
- Focus on data model `.local.dataset/*` for now
