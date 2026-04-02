import { getDashboardData } from "../../../lib/ecoroute-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const dashboard = await getDashboardData();
  return Response.json({
    ok: true,
    dashboard,
    summary: dashboard,
  });
}
