"use server";

import { validatePassword, createSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "请输入密码" };
  }

  if (!validatePassword(password)) {
    return { error: "密码错误" };
  }

  await createSession();
  redirect("/");
}
