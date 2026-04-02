import { moduleLibrary } from "../../../lib/site-data";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    count: moduleLibrary.length,
    modules: moduleLibrary,
  });
}
