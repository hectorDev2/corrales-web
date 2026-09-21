import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const VALID_RATINGS = ["Excelente", "Muy buena", "Buena", "Puede mejorar"] as const;

type FormType = "newsletter" | "survey" | "corporate-sales" | "job-application";

function textValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function formType(value: unknown): FormType | null {
  if (value === "newsletter" || value === "survey" || value === "corporate-sales") return value;
  if (value === "job-application" || value === "careers") return "job-application";
  return null;
}

async function parseBody(request: NextRequest): Promise<
  | { type: FormType; fields: FormData }
  | { type: FormType; fields: Record<string, unknown> }
  | { error: string }
> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const fields = await request.formData();
    const type = formType(textValue(fields.get("type") ?? fields.get("formType")));
    return type ? { type, fields } : { error: "Tipo de formulario inválido." };
  }

  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      const type = formType(body.type ?? body.formType);
      return type ? { type, fields: body } : { error: "Tipo de formulario inválido." };
    } catch {
      return { error: "El cuerpo de la solicitud no es válido." };
    }
  }

  return { error: "Content-Type no soportado." };
}

function recordValue(fields: FormData | Record<string, unknown>, key: string): string {
  const value = fields instanceof FormData ? fields.get(key) : fields[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const parsed = await parseBody(request);

  if ("error" in parsed) return jsonError(parsed.error);

  const { type, fields } = parsed;

  try {
    const admin = createSupabaseAdminClient();

    if (type === "newsletter") {
      const name = recordValue(fields, "name");
      const email = recordValue(fields, "email").toLowerCase();

      if (name.length < 2 || name.length > 120 || !isEmail(email)) {
        return jsonError("Ingresá un nombre y un correo electrónico válidos.");
      }

      const { error } = await admin
        .from("newsletter_subscriptions")
        .upsert({ name, email }, { onConflict: "email", ignoreDuplicates: true });

      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (type === "survey") {
      const rating = recordValue(fields, "rating");
      const comments = recordValue(fields, "comments");

      if (!VALID_RATINGS.includes(rating as (typeof VALID_RATINGS)[number])) {
        return jsonError("Seleccioná una calificación válida.");
      }
      if (comments.length > 2000) return jsonError("El comentario es demasiado largo.");

      const { error } = await admin.from("survey_responses").insert({
        rating,
        comments: comments || null,
      });

      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (type === "corporate-sales") {
      const firstName = recordValue(fields, "name");
      const lastName = recordValue(fields, "lastName");
      const email = recordValue(fields, "email").toLowerCase();
      const phone = recordValue(fields, "phoneNumber");
      const additionalInformation = recordValue(fields, "additionalInformation");
      const privacyPolicyAccepted =
        (fields instanceof FormData
          ? fields.get("privacyPolicy")
          : fields.privacyPolicy) === "true" ||
        (fields instanceof FormData ? fields.get("privacyPolicy") : fields.privacyPolicy) === true;

      if (
        firstName.length < 2 ||
        firstName.length > 100 ||
        lastName.length < 2 ||
        lastName.length > 100 ||
        !isEmail(email) ||
        !/^\d{9}$/.test(phone) ||
        additionalInformation.length > 2000 ||
        !privacyPolicyAccepted
      ) {
        return jsonError("Revisá los datos ingresados e intentá nuevamente.");
      }

      const { error } = await admin.from("corporate_sales_requests").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        additional_information: additionalInformation || null,
        privacy_policy_accepted: true,
      });

      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    const fullName = recordValue(fields, "name");
    const email = recordValue(fields, "email").toLowerCase();
    const phone = recordValue(fields, "phone");
    const acceptedTerms = recordValue(fields, "privacyPolicy") === "true";
    const resume = fields instanceof FormData ? fields.get("resume") : null;

    if (
      fullName.length < 2 ||
      fullName.length > 150 ||
      !isEmail(email) ||
      (phone && (phone.length < 7 || phone.length > 20)) ||
      !acceptedTerms ||
      !(resume instanceof File)
    ) {
      return jsonError("Completá los datos, aceptá la política y adjuntá tu CV.");
    }

    const isPdf = resume.type === "application/pdf" || resume.name.toLowerCase().endsWith(".pdf");
    if (resume.size === 0 || resume.size > MAX_RESUME_SIZE || !isPdf) {
      return jsonError("El CV debe ser un PDF de hasta 5 MB.");
    }

    const path = `${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("job-applications-cv")
      .upload(path, resume, { contentType: "application/pdf", upsert: false });

    if (uploadError) throw uploadError;

    const { error: insertError } = await admin.from("job_applications").insert({
      full_name: fullName,
      email,
      phone: phone || null,
      cv_storage_path: path,
      cv_file_name: resume.name.slice(0, 255),
      cv_content_type: "application/pdf",
      cv_size_bytes: resume.size,
      privacy_policy_accepted: true,
    });

    if (insertError) {
      await admin.storage.from("job-applications-cv").remove([path]);
      throw insertError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Public form submission failed:", error);
    return NextResponse.json(
      { message: "No pudimos recibir tu solicitud. Intentá nuevamente en unos minutos." },
      { status: 500 },
    );
  }
}
