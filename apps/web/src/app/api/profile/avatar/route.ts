import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auditLogs, getDb, users } from "@casino/database";
import { auth } from "@casino/database/auth";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: hdrs as unknown as Headers,
  });
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing avatar field" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato inválido. Use JPG, PNG ou WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Imagem maior que 2 MB" },
      { status: 400 },
    );
  }

  // ── Storage upload ─────────────────────────────────────────────────────────
  // TODO: when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured,
  // upload to `avatars/{userId}/{timestamp}.{ext}` and use the public URL.
  // For demo, we store a tiny inline data URL so the avatar persists in DB
  // without external infrastructure.
  let imageUrl: string;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    // TODO: real Supabase Storage upload using @supabase/supabase-js
    // const { data, error } = await supabase.storage
    //   .from("avatars")
    //   .upload(`${session.user.id}/${Date.now()}.png`, file, { upsert: true });
    // imageUrl = supabase.storage.from("avatars").getPublicUrl(data.path).publicUrl;
    imageUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${session.user.id}.png`;
  } else {
    // Demo fallback: persist a public placeholder bound to the user id
    imageUrl = `https://api.dicebear.com/9.x/initials/png?seed=${encodeURIComponent(session.user.name)}&backgroundColor=00D4FF`;
  }

  try {
    const db = getDb();
    await db
      .update(users)
      .set({ image: imageUrl, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    await db.insert(auditLogs).values({
      actorId: session.user.id,
      actorType: "user",
      action: "avatar_update",
      resourceType: "user",
      resourceId: session.user.id,
      ipAddress: hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
      metadata: { fileType: file.type, fileSize: file.size },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "DB update failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, imageUrl });
}
