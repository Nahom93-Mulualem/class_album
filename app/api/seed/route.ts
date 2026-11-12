import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/prisma/seed.mjs";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Always allow in development
  if (process.env.NODE_ENV !== "production") return true;

  // In production, require either valid secret or an authenticated ADMIN session
  const secret = req.nextUrl.searchParams.get("secret");
  const validSecret = process.env.ADMIN_SEED_SECRET;
  if (validSecret && secret === validSecret) return true;

  const user = await getCurrentUserFromCookie();
  return user?.role === "ADMIN";
}

async function handleSeed() {
  let result;
  try {
    result = await seedDatabase();
  } catch (firstErr) {
    const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
    if (errMsg.includes("does not exist") || errMsg.includes("relation")) {
      console.log("Tables missing in PostgreSQL. Running npx prisma db push...");
      try {
        execSync("npx prisma db push --accept-data-loss", { stdio: "pipe" });
        result = await seedDatabase();
      } catch (pushErr) {
        const pushMsg = pushErr instanceof Error ? pushErr.message : String(pushErr);
        throw new Error(`Schema push failed: ${pushMsg}. First error: ${errMsg}`);
      }
    } else {
      throw firstErr;
    }
  }

  return result;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json(
      { error: "Forbidden. Database seeding is locked in production to protect your cohort data." },
      { status: 403 }
    );
  }

  try {
    const result = await handleSeed();
    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with 1 Admin + 50 Students, posts, events, signatures, and messages!",
      details: result,
    });
  } catch (error) {
    console.error("Seeding API GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Seeding failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json(
      { error: "Forbidden. Database seeding is locked in production to protect your cohort data." },
      { status: 403 }
    );
  }

  try {
    const result = await handleSeed();
    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with 1 Admin + 50 Students, posts, events, signatures, and messages!",
      details: result,
    });
  } catch (error) {
    console.error("Seeding API POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Seeding failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
