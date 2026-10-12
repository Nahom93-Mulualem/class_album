import { NextResponse } from "next/server";
import { seedDatabase } from "@/prisma/seed.mjs";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

async function handleSeed() {
  let result;
  try {
    result = await seedDatabase();
  } catch (firstErr) {
    const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
    if (errMsg.includes("does not exist") || errMsg.includes("relation")) {
      console.log("Tables missing in PostgreSQL. Running npx prisma db push...");
      try {
        execSync("npx prisma db push --skip-generate", { stdio: "pipe" });
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

export async function GET() {
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

export async function POST() {
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
