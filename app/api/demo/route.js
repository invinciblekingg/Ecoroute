import { z } from "zod";
import { createPilotRequest, listPilots } from "../../../lib/ecoroute-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  company: z.string().trim().min(2, "City or organization is required"),
  goal: z.string().trim().min(8, "Tell us a little more about your pilot"),
  notes: z.string().trim().optional().default(""),
});

export async function GET() {
  const pilots = await listPilots();
  return Response.json({
    ok: true,
    count: pilots.length,
    pilots,
  });
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    return Response.json(
      {
        ok: false,
        message: "Please check the pilot form and try again.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const pilot = await createPilotRequest({
    ...result.data,
    source: "demo-form",
  });

  return Response.json(
    {
      ok: true,
      message: "Your pilot request was received.",
      pilot,
    },
    { status: 201 }
  );
}
