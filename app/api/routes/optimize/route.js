import { getDashboardData, optimizeRoute } from "../../../../lib/ecoroute-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeReportIds(reportIds) {
  if (Array.isArray(reportIds)) {
    return reportIds.filter(Boolean);
  }

  if (typeof reportIds === "string") {
    return reportIds
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET() {
  const dashboard = await getDashboardData();
  return Response.json({
    ok: true,
    plan: dashboard.routePlan,
  });
}

export async function POST(request) {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const plan = await optimizeRoute({
    ...payload,
    reportIds: normalizeReportIds(payload.reportIds),
  });
  const dashboard = await getDashboardData();

  return Response.json({
    ok: true,
    message: "Route optimized.",
    plan,
    summary: dashboard,
  });
}
