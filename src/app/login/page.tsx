"use client";

import { useState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Personal ERP
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            输入密码以访问系统
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="请输入密码"
              required
              autoComplete="current-password"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-green-500 text-white hover:bg-green-600"
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>
      </div>
    </div>
  );
}
