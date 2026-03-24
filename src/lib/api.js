import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error) {
  const status = error?.status || 500;
  const code = error?.code || "INTERNAL_ERROR";
  const message = error?.message || "Erro interno.";
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (error?.details) {
    payload.error.details = error.details;
  }

  return NextResponse.json(payload, { status });
}

export function withHandler(handler) {
  return async function wrappedHandler(request, context = {}) {
    try {
      return await handler(request, context);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error(error);
      }

      return fail(error);
    }
  };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Corpo JSON inválido.");
  }
}

export function requireFields(payload, fields) {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");

  if (missing.length > 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "Campos obrigatórios ausentes.", { missing });
  }
}

export function assert(condition, status, code, message, details) {
  if (!condition) {
    throw new ApiError(status, code, message, details);
  }
}

export function parsePagination(request) {
  const { searchParams } = new URL(request.url);
  return {
    branchId: searchParams.get("branchId"),
    companyId: searchParams.get("companyId"),
    status: searchParams.get("status"),
    limit: Number(searchParams.get("limit") || 50)
  };
}
