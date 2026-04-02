import { randomUUID } from "crypto";
import { z } from "zod";
import { getDashboardData, listLeaderboard, mutateState } from "../../../lib/ecoroute-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const awardSchema = z.object({
  label: z.string().trim().min(2, "A ward or team label is required"),
  points: z.coerce.number().int().positive("Points must be greater than zero"),
  badge: z.string().trim().optional().default(""),
});

export async function GET() {
  const leaderboard = await listLeaderboard();
  const dashboard = await getDashboardData();
  return Response.json({
    ok: true,
    leaderboard,
    summary: dashboard.operations,
  });
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const result = awardSchema.safeParse(payload);
  if (!result.success) {
    return Response.json(
      {
        ok: false,
        message: "Please check the reward payload.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const entry = await mutateState(async (state) => {
    const id = result.data.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let record = state.leaderboard.find((item) => item.id === id || item.label === result.data.label);

    if (!record) {
      record = {
        id: `ward-${randomUUID()}`,
        label: result.data.label,
        points: 0,
        badges: [],
        completedReports: 0,
      };
      state.leaderboard.push(record);
    }

    record.points = (record.points ?? 0) + result.data.points;
    record.completedReports = (record.completedReports ?? 0) + 1;
    if (result.data.badge) {
      record.badges = Array.from(new Set([...(record.badges ?? []), result.data.badge]));
    }

    state.notifications.unshift({
      id: `note-${randomUUID()}`,
      type: "reward",
      title: "Reward points updated",
      body: `${result.data.label} earned ${result.data.points} points.`,
      relatedId: record.id,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return record;
  });

  return Response.json({
    ok: true,
    message: "Reward updated.",
    entry,
  });
}
