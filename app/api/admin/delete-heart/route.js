import { NextResponse } from "next/server";
import { BUCKET_NAME } from "../../../../lib/supabaseClient";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

function extractObjectPathFromPublicUrl(imageUrl) {
  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx < 0) return null;
    const rawPath = url.pathname.slice(idx + marker.length);
    return decodeURIComponent(rawPath);
  } catch {
    return null;
  }
}

export async function POST(req) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Server is not configured for admin delete." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
  if (!ids.length) {
    return NextResponse.json({ error: "No items selected." }, { status: 400 });
  }

  const { data: rows, error: fetchError } = await supabaseAdmin
    .from("hearts")
    .select("id, image_url")
    .in("id", ids);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const objectPaths = (rows || [])
    .map((r) => extractObjectPathFromPublicUrl(r.image_url))
    .filter(Boolean);

  if (objectPaths.length) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove(objectPaths);
    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }
  }

  const { error: deleteError } = await supabaseAdmin.from("hearts").delete().in("id", ids);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: ids.length });
}

