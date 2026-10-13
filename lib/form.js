export function emptyForm() {
  return {
    arrival_window: null,
    stay_reason: null,
    airport_transfer: null,
    scent_code: null,
    pillow_codes: [],
    comfort_codes: [],
    allergy_codes: [],
    diet_codes: [],
    diet_notes: "",
    spa_codes: [],
    experience_codes: [],
    celebration_code: null,
    special_request: "",
    whatsapp: "",
  };
}

export function unwrapSubmission(submission) {
  if (!submission || typeof submission !== "object") return null;
  if (submission.data && typeof submission.data === "object" && "status" in submission.data) {
    return submission.data;
  }
  if ("status" in submission) return submission;
  return null;
}

export function formFromSubmission(submission) {
  const data = unwrapSubmission(submission) || submission;
  if (!data || typeof data !== "object" || !("status" in data || "arrival_window" in data)) {
    return emptyForm();
  }
  const base = emptyForm();
  return {
    arrival_window: data.arrival_window ?? base.arrival_window,
    stay_reason: singleCode(data.stay_reason ?? data.stay_reasons),
    airport_transfer: data.airport_transfer ?? base.airport_transfer,
    scent_code: data.scent_code ?? base.scent_code,
    pillow_codes: Array.isArray(data.pillow_codes) ? data.pillow_codes : [],
    comfort_codes: Array.isArray(data.comfort_codes) ? data.comfort_codes : [],
    allergy_codes: Array.isArray(data.allergy_codes) ? data.allergy_codes : [],
    diet_codes: Array.isArray(data.diet_codes) ? data.diet_codes : [],
    diet_notes: data.diet_notes ?? "",
    spa_codes: Array.isArray(data.spa_codes) ? data.spa_codes : [],
    experience_codes: Array.isArray(data.experience_codes) ? data.experience_codes : [],
    celebration_code: data.celebration_code ?? null,
    special_request: data.special_request ?? "",
    whatsapp: String(data.whatsapp ?? "").slice(0, 40),
  };
}

export function payloadFromForm(form) {
  return {
    arrival_window: form.arrival_window || null,
    stay_reason: form.stay_reason || null,
    airport_transfer: form.airport_transfer || null,
    scent_code: form.scent_code || null,
    pillow_codes: form.pillow_codes || [],
    comfort_codes: form.comfort_codes || [],
    allergy_codes: form.allergy_codes || [],
    diet_codes: form.diet_codes || [],
    diet_notes: form.diet_notes || "",
    spa_codes: form.spa_codes || [],
    experience_codes: form.experience_codes || [],
    celebration_code: form.celebration_code || null,
    special_request: form.special_request || "",
    whatsapp: String(form.whatsapp || "").slice(0, 40),
  };
}

function singleCode(value) {
  if (typeof value === "string" && value) return value;
  if (Array.isArray(value)) return value.find((item) => typeof item === "string" && item) || null;
  return null;
}

export function selectionMode(catalog, step) {
  const group = catalog?.steps?.find((item) => item.step === step);
  return group?.selection_mode === "multi" ? "multi" : "single";
}

export function toggleCode(selected, code, options) {
  const current = Array.isArray(selected) ? selected : [];
  const option = options.find((item) => item.code === code);
  const exclusive = options.filter((item) => item.is_exclusive).map((item) => item.code);
  if (option?.is_exclusive) {
    return current.length === 1 && current[0] === code ? [] : [code];
  }
  const withoutExclusive = current.filter((item) => !exclusive.includes(item));
  if (withoutExclusive.includes(code)) {
    return withoutExclusive.filter((item) => item !== code);
  }
  return [...withoutExclusive, code];
}

export function stepBlocker(step, form) {
  if (step === 1 && (!form.arrival_window || !form.airport_transfer)) return "required_arrival";
  if (step === 2 && !form.scent_code) return "required_scent";
  if (step === 7 && !form.celebration_code) return "required_celebration";
  return null;
}

export function stepForMissing(form) {
  if (!form.arrival_window || !form.airport_transfer) return 1;
  if (!form.scent_code) return 2;
  if (!form.celebration_code) return 7;
  return 7;
}

export function optionsFor(catalog, step) {
  const group = catalog?.steps?.find((item) => item.step === step);
  if (!group) return [];
  return [...group.options].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export function labelFor(catalog, step, code) {
  if (!code) return "";
  const match = optionsFor(catalog, step).find((item) => item.code === code);
  return match?.label || code;
}

export function labelsFor(catalog, step, codes) {
  return (codes || [])
    .map((code) => labelFor(catalog, step, code))
    .filter(Boolean)
    .join(", ");
}

export function formatStay(checkIn, checkOut, locale) {
  if (!checkIn || !checkOut) return "";
  const loc = locale === "en" ? "en-US" : "es-MX";
  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const fmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short" });
  return `${fmt.format(start)} – ${fmt.format(end)} ${end.getFullYear()}`;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
