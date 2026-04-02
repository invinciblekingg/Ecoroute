import { randomUUID } from "crypto";
import { z } from "zod";
import { createNotification, listNotifications, mutateState } from "../../../lib/ecoroute-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  type: z.string().trim().optional().default("info"),
  title: z.string().trim().min(2, "Title is required"),
  body: z.string().trim().min(2, "Body is required"),
  relatedId: z.string().trim().optional().default(""),
});

const patchSchema = z.object({
  notificationId: z.string().trim().optional().default(""),
  read: z.coerce.boolean().optional().default(true),
});

export async function GET() {
  const notifications = await listNotifications();
  return Response.json({
    ok: true,
    count: notifications.length,
    notifications,
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
        message: "Please check the notification payload.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const notification = await createNotification({
    ...result.data,
    relatedId: result.data.relatedId || null,
  });

  return Response.json(
    {
      ok: true,
      message: "Notification created.",
      notification,
    },
    { status: 201 }
  );
}

export async function PATCH(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON payload." }, { status: 400 });
  }

  const result = patchSchema.safeParse(payload);
  if (!result.success) {
    return Response.json(
      {
        ok: false,
        message: "Please check the notification update payload.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const updated = await mutateState(async (state) => {
    if (result.data.notificationId) {
      const record = state.notifications.find((item) => item.id === result.data.notificationId);
      if (!record) {
        return null;
      }
      record.read = result.data.read;
      return record;
    }

    state.notifications.forEach((item) => {
      item.read = result.data.read;
    });

    return {
      id: `note-${randomUUID()}`,
      type: "bulk-update",
      title: "Notifications updated",
      body: "All notifications were marked as read.",
      createdAt: new Date().toISOString(),
      read: true,
    };
  });

  if (!updated) {
    return Response.json({ ok: false, message: "Notification not found." }, { status: 404 });
  }

  return Response.json({
    ok: true,
    message: "Notifications updated.",
    notification: updated,
  });
}
