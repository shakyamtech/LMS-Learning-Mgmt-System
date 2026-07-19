"use server";

import { db } from "@/lib/firebase";
import { decryptSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface SlideInput {
  title: string;
  subtitle: string;
  image: string;
}

export async function saveHomepageConfig(slides: SlideInput[]) {
  // Validate admin session
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { error: "Unauthorized" };

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  // Validate slides input
  if (!Array.isArray(slides) || slides.length === 0) {
    return { error: "At least one slide configuration is required." };
  }

  for (const slide of slides) {
    if (!slide.title || !slide.subtitle || !slide.image) {
      return { error: "All fields (Title, Subtitle, Image URL) are required for each slide." };
    }
  }

  try {
    await db.collection("config").doc("homepage").set({
      slides,
      updatedAt: new Date().toISOString(),
    });
    
    // Revalidate home page path to clear cache
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Save CMS config error:", error);
    return { error: "Failed to save homepage settings." };
  }
}
