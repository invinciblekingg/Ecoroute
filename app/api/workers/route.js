import { randomUUID } from "crypto";
import { z } from "zod";
import { listWorkers, mutateState } from "../../../lib/ecoroute-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(2, "Worker name is required"),
  vehicle: z.string().trim().optional().default(""),
  zone: z.string().trim().optional().default(""),
  status: z.string().trim().optional().default("available"),
  currentTask: z.string().trim().optional().default("Available"),
});

export async function GET() {
  const workers = await listWorkers();
  return Response.json({
    ok: true,
    count: workers.length,
    workers,
  });
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const result = createSchema.safeParse(payload);
  if (!result.success) {
    return Response.json(
      {
        ok: false,
        message: "Please check the worker details.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const worker = await mutateState(async (state) => {
    const record = {
      id: `worker-${randomUUID()}`,
      name: result.data.name,
      vehicle: result.data.vehicle,
      zone: result.data.zone,
      status: result.data.status,
      currentTask: result.data.currentTask,
      currentReportId: null,
      routePlanId: null,
      completedToday: 0,
      shiftStart: "08:00",
      shiftEnd: "16:00",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.workers.push(record);
    return record;
  });

  return Response.json(
    {
      ok: true,
      message: "Worker created.",
      worker,
    },
    { status: 201 }
  );
}
