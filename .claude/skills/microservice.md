---
name: Microservice Scaffold
description: How to scaffold a new API module for SKINgenius
triggers:
  - create microservice
  - new module
  - scaffold api module
---

# Microservice Scaffold — SKINgenius

How to scaffold a new API module for SKINgenius.

## Architecture

SKINgenius uses Next.js App Router API routes with the following structure:

```
src/
├── app/api/v1/
│   ├── <module-name>/
│   │   ├── route.ts           # List + Create
│   │   └── [id]/
│   │       └── route.ts       # Read + Update + Delete
│   └── ...
├── lib/
│   └── <module-name>/        # Business logic
│       ├── index.ts
│       ├── queries.ts         # Database queries
│       └── validation.ts      # Zod schemas
├── types/
│   └── api.ts                 # Shared API types
└── utils/
    └── supabase/              # Supabase clients
        ├── server.ts
        ├── client.ts
        └── middleware.ts
```

## Steps

### 1. Create Route in `src/app/api/v1/<name>/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const createSchema = z.object({
  // Define fields
});

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const validated = createSchema.parse(body);
  
  // Business logic
  return NextResponse.json({ data: result }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // List with pagination
  return NextResponse.json({ data, total, page, limit });
}
```

### 2. Create Types in `src/types/api.ts`

```typescript
export interface Create<Name>Body {
  // Fields
}

export interface Update<Name>Body {
  // Partial fields
}

export interface <Name>Response {
  id: string;
  // Fields
  createdAt: string;
  updatedAt: string;
}
```

### 3. Create Lib in `src/lib/<name>/`

```typescript
// src/lib/<name>/index.ts
export * from './queries';
export * from './validation';

// src/lib/<name>/validation.ts
import { z } from 'zod';

export const createSchema = z.object({
  // Validation schemas
});

export const updateSchema = createSchema.partial();

// src/lib/<name>/queries.ts
import { createClient } from '@/utils/supabase/server';

export async function listItems(options: { page: number; limit: number }) {
  const supabase = await createClient();
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;
  
  const { data, error, count } = await supabase
    .from('items')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return { data, count: count || 0 };
}
```

### 4. Update `API-ARCHITECTURE.md`

Add the new module to the architecture docs:

```markdown
## <Name> Module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/<name> | Required | Create |
| GET | /api/v1/<name> | Required | List |
| GET | /api/v1/<name>/:id | Required | Read |
| PATCH | /api/v1/<name>/:id | Required | Update |
| DELETE | /api/v1/<name>/:id | Required | Delete |
```

### 5. Add to `openapi.yaml`

Add OpenAPI spec for the new endpoints:

```yaml
/<name>:
  get:
    summary: List <name>
    tags: [<Name>]
    security:
      - bearerAuth: []
    parameters:
      - name: page
        in: query
        schema: { type: integer, default: 1 }
      - name: limit
        in: query
        schema: { type: integer, default: 20, maximum: 100 }
    responses:
      200:
        description: Success
      401:
        description: Unauthorized
```

## Checklist

- [ ] Route file created at `src/app/api/v1/<name>/route.ts`
- [ ] Single resource route at `src/app/api/v1/<name>/[id]/route.ts`
- [ ] Types added to `src/types/api.ts`
- [ ] Lib module created at `src/lib/<name>/`
- [ ] `API-ARCHITECTURE.md` updated
- [ ] `openapi.yaml` updated
- [ ] Input validation with Zod
- [ ] Auth check on every route
- [ ] Proper HTTP status codes
- [ ] Pagination on list endpoint
- [ ] No file exceeds 300 lines
- [ ] No function exceeds 50 lines
- [ ] Error handling on every async operation
