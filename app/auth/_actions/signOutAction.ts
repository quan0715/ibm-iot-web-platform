"use server";
import { signOut, auth } from "@/lib/auth";
export async function signOutAction() {
  console.log("signOutAction");
  await signOut({
    redirect: false,
  });

  return { success: "Sign out successful" };
}
