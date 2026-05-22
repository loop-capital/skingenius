import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  birth_date: string | null;
  gender: "male" | "female" | "non_binary" | "prefer_not_say" | null;
  location: string | null;
  skin_concerns: string[] | null;
  allergies: string[] | null;
  current_medications: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SkinTypeAssessment {
  id: string;
  user_id: string;
  skin_type: "oily" | "dry" | "combination" | "normal" | "sensitive" | null;
  oiliness: number | null; // 1-10
  hydration: number | null; // 1-10
  sensitivity: number | null; // 1-10
  pore_size: "small" | "medium" | "large" | null;
  acne_frequency: "rare" | "occasional" | "frequent" | "severe" | null;
  completed_at: string;
}

export interface SkinAnalysis {
  id: string;
  user_id: string;
  image_url: string | null;
  conditions: Array<{
    condition: string;
    confidence: number;
    severity: "mild" | "moderate" | "severe" | null;
  }>;
  skin_score: number | null; // 0-100
  notes: string | null;
  urgent_flag: boolean;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  time_of_day: "am" | "pm" | "both" | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineStep {
  id: string;
  routine_id: string;
  step_order: number;
  product_name: string;
  product_id: string | null;
  category:
    | "cleanser"
    | "toner"
    | "serum"
    | "moisturizer"
    | "sunscreen"
    | "treatment"
    | "eye_cream"
    | "mask"
    | "oil"
    | "other";
  instructions: string | null;
  frequency: "daily" | "weekly" | "as_needed" | null;
  created_at: string;
}

export interface Ingredient {
  id: string;
  inci_name: string;
  common_names: string[] | null;
  category:
    | "active"
    | "emollient"
    | "surfactant"
    | "preservative"
    | "antioxidant"
    | "exfoliant"
    | "humectant"
    | "peptide"
    | "vitamin"
    | "botanical"
    | "other";
  functions: string[] | null;
  evidence_score: number | null; // 0-100
  safety_rating: "A" | "B" | "C" | "D" | null;
  description: string | null;
  mechanism: string | null;
  common_concentration: string | null;
  contraindications: string[] | null;
  related_ingredient_ids: string[] | null;
  created_at: string;
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

function notFound(path: string) {
  return NextResponse.json(
    { error: "Not found", path },
    { status: 404 }
  );
}

function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: "Bad request", message, details },
    { status: 400 }
  );
}

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function serverError(message: string, error?: unknown) {
  const detail =
    error instanceof Error ? error.message : String(error ?? "");
  return NextResponse.json(
    { error: "Internal server error", message, detail },
    { status: 500 }
  );
}

async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

function parseRouteSegments(
  routeParam: string | string[] | undefined
): string[] {
  if (!routeParam) return [];
  return Array.isArray(routeParam) ? routeParam : [routeParam];
}

// ───────────────────────────────────────────────────────────────
// Route Handlers
// ───────────────────────────────────────────────────────────────

/**
 * GET /api/profiles
 * GET /api/profiles/skin-type
 *
 * POST /api/profiles
 *
 * POST /api/analyses
 * GET /api/analyses
 * GET /api/analyses/:id
 * GET /api/analyses/latest
 *
 * GET /api/routines
 * POST /api/routines
 * PUT /api/routines/:id
 * DELETE /api/routines/:id
 * GET /api/routines/:id/steps
 *
 * GET /api/ingredients
 * GET /api/ingredients/:id
 * GET /api/ingredients/search?q=
 * GET /api/ingredients/:id/related
 */

// ─── PROFILES ───────────────────────────────────────────────────

async function getProfile(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(null); // no profile yet
    }
    return serverError("Failed to fetch profile", error);
  }

  return NextResponse.json(data as UserProfile);
}

async function upsertProfile(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Partial<UserProfile>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const upsertData = {
    user_id: user.id,
    display_name: body.display_name ?? null,
    birth_date: body.birth_date ?? null,
    gender: body.gender ?? null,
    location: body.location ?? null,
    skin_concerns: body.skin_concerns ?? null,
    allergies: body.allergies ?? null,
    current_medications: body.current_medications ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(upsertData, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return serverError("Failed to save profile", error);

  return NextResponse.json(data as UserProfile);
}

async function getSkinType(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("skin_type_assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return serverError("Failed to fetch skin type", error);

  return NextResponse.json(data as SkinTypeAssessment | null);
}

// ─── ANALYSES ───────────────────────────────────────────────────

async function createAnalysis(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Partial<SkinAnalysis>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.conditions || !Array.isArray(body.conditions)) {
    return badRequest("'conditions' array is required");
  }

  const insertData = {
    user_id: user.id,
    image_url: body.image_url ?? null,
    conditions: body.conditions,
    skin_score: body.skin_score ?? null,
    notes: body.notes ?? null,
    urgent_flag: body.urgent_flag ?? false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("skin_analyses")
    .insert(insertData)
    .select()
    .single();

  if (error) return serverError("Failed to create analysis", error);

  return NextResponse.json(data as SkinAnalysis, { status: 201 });
}

async function listAnalyses(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const { data, error, count } = await supabase
    .from("skin_analyses")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return serverError("Failed to list analyses", error);

  return NextResponse.json({
    data: data as SkinAnalysis[],
    count,
    limit,
    offset,
  });
}

async function getAnalysis(req: NextRequest, id: string) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("skin_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }
    return serverError("Failed to fetch analysis", error);
  }

  return NextResponse.json(data as SkinAnalysis);
}

async function getLatestAnalysis(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from("skin_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return serverError("Failed to fetch latest analysis", error);

  if (!data) {
    return NextResponse.json(
      { error: "No analyses found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data as SkinAnalysis);
}

// ─── ROUTINES ───────────────────────────────────────────────────

async function listRoutines(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get("is_active");

  let query = supabase
    .from("routines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (isActive !== null) {
    query = query.eq("is_active", isActive === "true");
  }

  const { data, error } = await query;

  if (error) return serverError("Failed to list routines", error);

  return NextResponse.json(data as Routine[]);
}

async function createRoutine(req: NextRequest) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Partial<Routine>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  if (!body.name) {
    return badRequest("'name' is required");
  }

  const insertData = {
    user_id: user.id,
    name: body.name,
    description: body.description ?? null,
    is_active: body.is_active ?? true,
    time_of_day: body.time_of_day ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("routines")
    .insert(insertData)
    .select()
    .single();

  if (error) return serverError("Failed to create routine", error);

  return NextResponse.json(data as Routine, { status: 201 });
}

async function updateRoutine(req: NextRequest, id: string) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Partial<Routine>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined)
    updateData.description = body.description;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;
  if (body.time_of_day !== undefined)
    updateData.time_of_day = body.time_of_day;

  const { data, error } = await supabase
    .from("routines")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Routine not found" },
        { status: 404 }
      );
    }
    return serverError("Failed to update routine", error);
  }

  return NextResponse.json(data as Routine);
}

async function deleteRoutine(req: NextRequest, id: string) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return serverError("Failed to delete routine", error);

  return NextResponse.json({ success: true, id });
}

async function getRoutineSteps(req: NextRequest, id: string) {
  const { user, supabase } = await getCurrentUser();
  if (!user) return unauthorized();

  // Verify routine ownership
  const { data: routine, error: routineError } = await supabase
    .from("routines")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (routineError || !routine) {
    return NextResponse.json(
      { error: "Routine not found" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("routine_steps")
    .select("*")
    .eq("routine_id", id)
    .order("step_order", { ascending: true });

  if (error) return serverError("Failed to fetch routine steps", error);

  return NextResponse.json(data as RoutineStep[]);
}

// ─── INGREDIENTS ────────────────────────────────────────────────

async function listIngredients(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const category = searchParams.get("category");

  const sb = getPublicSupabase();
  let query = sb
    .from("ingredients")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error, count } = await query;

  if (error) return serverError("Failed to list ingredients", error);

  return NextResponse.json({
    data: data as Ingredient[],
    count,
    limit,
    offset,
  });
}

async function getIngredient(req: NextRequest, id: string) {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("ingredients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }
    return serverError("Failed to fetch ingredient", error);
  }

  return NextResponse.json(data as Ingredient);
}

async function searchIngredients(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return badRequest("Query parameter 'q' must be at least 2 characters");
  }

  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const sb = getPublicSupabase();

  // Use Supabase full-text or ilike search
  const { data, error } = await sb
    .from("ingredients")
    .select("*")
    .or(
      `inci_name.ilike.%${q}%,common_names.cs.{"${q}"}`
    )
    .limit(limit);

  if (error) {
    // Fallback: simple ilike if the above fails (e.g. no GIN index)
    const { data: fallbackData, error: fallbackError } = await sb
      .from("ingredients")
      .select("*")
      .ilike("inci_name", `%${q}%`)
      .limit(limit);

    if (fallbackError)
      return serverError("Failed to search ingredients", fallbackError);

    return NextResponse.json({
      data: fallbackData as Ingredient[],
      query: q,
      limit,
    });
  }

  return NextResponse.json({
    data: data as Ingredient[],
    query: q,
    limit,
  });
}

async function getRelatedIngredients(req: NextRequest, id: string) {
  const sb = getPublicSupabase();
  const { data, error } = await sb
    .from("ingredients")
    .select("related_ingredient_ids")
    .eq("id", id)
    .single();

  if (error || !data?.related_ingredient_ids?.length) {
    return NextResponse.json([]);
  }

  const { data: related, error: relatedError } = await sb
    .from("ingredients")
    .select("*")
    .in("id", data.related_ingredient_ids);

  if (relatedError)
    return serverError("Failed to fetch related ingredients", relatedError);

  return NextResponse.json(related as Ingredient[]);
}

// ─── KNOWLEDGE GRAPH ────────────────────────────────────────────

async function getKnowledgeConditions(req: NextRequest) {
  const sb = getPublicSupabase();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let query = sb
    .from('skin_conditions')
    .select(`
      *,
      root_causes (*),
      recommendations (*),
      zone_conditions (zone_id, primary_concern, severity)
    `);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) return serverError('Failed to fetch conditions', error);

  // Transform into the format expected by the scan flow
  const conditions = (data || []).map((c: Record<string, unknown>) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
    description: c.description,
    icd10: c.icd10_code || c.icd_code,
    severity: (typeof c.severity_scale === 'string' ? c.severity_scale : 'mild_moderate_severe').split('_'),
    features: c.features || [],
    affectedZones: c.affected_zones || [],
    fitzpatrickNotes: c.fitzpatrick_notes || '',
    requiresDermatologist: c.requires_dermatologist || false,
    rootCauses: Array.isArray(c.root_causes) ? (c.root_causes as Record<string, unknown>[]).map((rc: Record<string, unknown>) => ({
      cause: rc.cause,
      domain: rc.domain,
      evidence: rc.evidence,
      description: rc.description,
    })) : [],
    recommendations: Array.isArray(c.recommendations) ? groupRecommendations(c.recommendations as Record<string, unknown>[]) : [],
  }));

  return NextResponse.json({ conditions });
}

async function getKnowledgeCondition(req: NextRequest, slug: string) {
  const sb = getPublicSupabase();

  const { data, error } = await sb
    .from('skin_conditions')
    .select(`
      *,
      root_causes (*),
      recommendations (*),
      zone_conditions (zone_id, primary_concern, severity)
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Condition not found' }, { status: 404 });
  }

  const c = data as Record<string, unknown>;
  return NextResponse.json({
    slug: c.slug,
    name: c.name,
    category: c.category,
    description: c.description,
    icd10: c.icd10_code || c.icd_code,
    severity: (typeof c.severity_scale === 'string' ? c.severity_scale : 'mild_moderate_severe').split('_'),
    features: c.features || [],
    affectedZones: c.affected_zones || [],
    fitzpatrickNotes: c.fitzpatrick_notes || '',
    requiresDermatologist: c.requires_dermatologist || false,
    rootCauses: Array.isArray(c.root_causes) ? (c.root_causes as Record<string, unknown>[]).map((rc: Record<string, unknown>) => ({
      cause: rc.cause,
      domain: rc.domain,
      evidence: rc.evidence,
      description: rc.description,
    })) : [],
    recommendations: Array.isArray(c.recommendations) ? groupRecommendations(c.recommendations as Record<string, unknown>[]) : [],
  });
}

async function getKnowledgeZones(req: NextRequest) {
  const sb = getPublicSupabase();

  const { data, error } = await sb
    .from('facial_zones')
    .select(`
      *,
      zone_conditions (condition_slug, primary_concern, severity)
    `)
    .order('display_order');

  if (error) return serverError('Failed to fetch zones', error);

  return NextResponse.json({ zones: data });
}

async function getKnowledgeRootCauses(req: NextRequest) {
  const sb = getPublicSupabase();
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  const condition = searchParams.get('condition');

  let query = sb
    .from('root_causes')
    .select('*');

  if (domain) query = query.eq('domain', domain);
  if (condition) query = query.eq('condition_slug', condition);

  const { data, error } = await query;

  if (error) return serverError('Failed to fetch root causes', error);

  return NextResponse.json({ rootCauses: data });
}

async function getKnowledgeRecommendations(req: NextRequest) {
  const sb = getPublicSupabase();
  const { searchParams } = new URL(req.url);
  const condition = searchParams.get('condition');
  const tier = searchParams.get('tier');

  let query = sb
    .from('recommendations')
    .select('*');

  if (condition) query = query.eq('condition_slug', condition);
  if (tier) query = query.eq('tier', tier);

  const { data, error } = await query;

  if (error) return serverError('Failed to fetch recommendations', error);

  return NextResponse.json({ recommendations: data });
}

function groupRecommendations(recs: Record<string, unknown>[]) {
  const grouped = {
    products: [] as Record<string, unknown>[],
    supplements: [] as Record<string, unknown>[],
    practitioner: [] as Record<string, unknown>[],
    basys_health: [] as Record<string, unknown>[],
  };

  for (const r of recs) {
    const entry = {
      name: r.name,
      description: r.description,
      evidence: r.evidence,
      ...(r.dosage ? { dosage: r.dosage } : {}),
      ...(r.duration ? { duration: r.duration } : {}),
      ...(r.pregnancy_safe !== null ? { pregnancySafe: r.pregnancy_safe } : {}),
      ...(Array.isArray(r.fitzpatrick_safe) && r.fitzpatrick_safe.length ? { fitzpatrickSafe: r.fitzpatrick_safe } : {}),
      ...(Array.isArray(r.contraindications) && r.contraindications.length ? { contraindications: r.contraindications } : {}),
    };
    const tier = r.tier as keyof typeof grouped;
    if (tier in grouped) {
      grouped[tier].push(entry);
    }
  }

  return grouped;
}

// ───────────────────────────────────────────────────────────────
// Router
// ───────────────────────────────────────────────────────────────

// Direct Supabase client for public/unauthenticated endpoints (ingredients)
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
}

async function handleRequest(req: NextRequest): Promise<NextResponse> {
  const segments = parseRouteSegments(
    req.nextUrl.pathname.replace("/api/", "")
  );

  if (segments.length === 0) {
    return NextResponse.json({
      name: "SKINgenius API",
      version: "0.1.0",
      endpoints: {
        profiles: ["GET /api/profiles", "POST /api/profiles", "GET /api/profiles/skin-type"],
        analyses: [
          "GET /api/analyses",
          "POST /api/analyses",
          "GET /api/analyses/:id",
          "GET /api/analyses/latest",
        ],
        analysis: [
          "POST /api/analysis/upload (EXIF strip + quality check)",
          "POST /api/analysis/classify (condition classification)",
          "GET /api/analysis/:id (full results + root causes)",
          "DELETE /api/analysis/:id/image (privacy: delete stored image)",
        ],
        knowledge: [
          "GET /api/knowledge/conditions",
          "GET /api/knowledge/conditions/:slug",
          "GET /api/knowledge/zones",
          "GET /api/knowledge/root-causes?domain=gut|hormones|nutrition|lifestyle|skin",
          "GET /api/knowledge/recommendations?condition=slug&tier=product|supplement|practitioner|basys_health",
        ],
        routines: [
          "GET /api/routines",
          "POST /api/routines",
          "PUT /api/routines/:id",
          "DELETE /api/routines/:id",
          "GET /api/routines/:id/steps",
        ],
        ingredients: [
          "GET /api/ingredients",
          "GET /api/ingredients/:id",
          "GET /api/ingredients/search?q=",
          "GET /api/ingredients/:id/related",
        ],
      },
    });
  }

  const [resource, idOrAction, subResource] = segments;

  // ─── PROFILES ───────────────────────────────────────────────
  if (resource === "profiles") {
    if (idOrAction === "skin-type" && req.method === "GET") {
      return getSkinType(req);
    }

    if (!idOrAction) {
      if (req.method === "GET") return getProfile(req);
      if (req.method === "POST") return upsertProfile(req);
      return notFound(req.nextUrl.pathname);
    }

    return notFound(req.nextUrl.pathname);
  }

  // ─── ANALYSES ───────────────────────────────────────────────
  if (resource === "analyses") {
    if (!idOrAction) {
      if (req.method === "GET") return listAnalyses(req);
      if (req.method === "POST") return createAnalysis(req);
      return notFound(req.nextUrl.pathname);
    }

    if (idOrAction === "latest" && req.method === "GET") {
      return getLatestAnalysis(req);
    }

    if (req.method === "GET") {
      return getAnalysis(req, idOrAction);
    }

    return notFound(req.nextUrl.pathname);
  }

  // ─── ROUTINES ───────────────────────────────────────────────
  if (resource === "routines") {
    if (!idOrAction) {
      if (req.method === "GET") return listRoutines(req);
      if (req.method === "POST") return createRoutine(req);
      return notFound(req.nextUrl.pathname);
    }

    if (subResource === "steps" && req.method === "GET") {
      return getRoutineSteps(req, idOrAction);
    }

    if (req.method === "PUT") return updateRoutine(req, idOrAction);
    if (req.method === "DELETE") return deleteRoutine(req, idOrAction);

    return notFound(req.nextUrl.pathname);
  }

  // ─── KNOWLEDGE GRAPH ───────────────────────────────────────
  if (resource === "knowledge") {
    // GET /api/knowledge/conditions — All conditions with root causes + recommendations
    if (idOrAction === "conditions" && req.method === "GET") {
      return getKnowledgeConditions(req);
    }
    // GET /api/knowledge/conditions/:slug — Single condition with full detail
    if (idOrAction === "conditions" && subResource && req.method === "GET") {
      return getKnowledgeCondition(req, subResource);
    }
    // GET /api/knowledge/zones — All facial zones with condition mappings
    if (idOrAction === "zones" && req.method === "GET") {
      return getKnowledgeZones(req);
    }
    // GET /api/knowledge/root-causes?domain=gut — Root causes by domain
    if (idOrAction === "root-causes" && req.method === "GET") {
      return getKnowledgeRootCauses(req);
    }
    // GET /api/knowledge/recommendations?condition=acne-vulgaris&tier=product
    if (idOrAction === "recommendations" && req.method === "GET") {
      return getKnowledgeRecommendations(req);
    }
    return notFound(req.nextUrl.pathname);
  }

  // ─── ANALYSIS PIPELINE ────────────────────────────────────
  if (resource === "analysis") {
    // POST /api/analysis/upload  — Tier 0 + Tier 1 (EXIF strip + quality check)
    if (idOrAction === "upload" && req.method === "POST") {
      const { POST_upload } = await import("@/lib/scan/analysisPipeline");
      return POST_upload(req);
    }
    // POST /api/analysis/classify — Tier 2 + Tier 3 (MiMo + premium fallback)
    if (idOrAction === "classify" && req.method === "POST") {
      const { POST_classify } = await import("@/lib/scan/analysisPipeline");
      return POST_classify(req);
    }
    // DELETE /api/analysis/:id/image — Privacy: delete stored image
    if (subResource === "image" && req.method === "DELETE") {
      const { DELETE_image } = await import("@/lib/scan/analysisPipeline");
      return DELETE_image(req, idOrAction);
    }
    // GET /api/analysis/:id — Full results with root causes
    if (idOrAction && !subResource && req.method === "GET") {
      return getAnalysis(req, idOrAction);
    }
    return notFound(req.nextUrl.pathname);
  }

  // ─── INGREDIENTS ────────────────────────────────────────────
  if (resource === "ingredients") {
    if (!idOrAction) {
      if (req.method === "GET") return listIngredients(req);
      return notFound(req.nextUrl.pathname);
    }

    if (idOrAction === "search" && req.method === "GET") {
      return searchIngredients(req);
    }

    if (subResource === "related" && req.method === "GET") {
      return getRelatedIngredients(req, idOrAction);
    }

    if (req.method === "GET") {
      return getIngredient(req, idOrAction);
    }

    return notFound(req.nextUrl.pathname);
  }

  return notFound(req.nextUrl.pathname);
}

// ───────────────────────────────────────────────────────────────
// HTTP Methods
// ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

export async function PUT(req: NextRequest) {
  return handleRequest(req);
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req);
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req);
}
