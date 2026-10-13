const DB_KEY = "prearrival_mock_db";
const ATTEMPTS_KEY = "prearrival_lookup_attempts";
const ATTEMPT_LIMIT = 8;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function readDb() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || "");
    if (!parsed || typeof parsed !== "object") return { bookings: {}, tokens: {} };
    return {
      bookings: parsed.bookings || {},
      tokens: parsed.tokens || {},
    };
  } catch {
    return { bookings: {}, tokens: {} };
  }
}

function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function fail(status, code) {
  const error = new Error(code);
  error.status = status;
  error.code = code;
  return error;
}

function t(locale, es, en, subtitleEs = null, subtitleEn = null) {
  const english = locale === "en";
  return {
    label: english ? en : es,
    subtitle: english ? subtitleEn : subtitleEs,
  };
}

function option(code, sort, copy, exclusive = false) {
  return {
    code,
    label: copy.label,
    subtitle: copy.subtitle,
    is_exclusive: exclusive,
    sort_order: sort,
  };
}

export function catalog(locale) {
  const L = (es, en, subtitleEs = null, subtitleEn = null) => t(locale, es, en, subtitleEs, subtitleEn);
  return {
    success: true,
    locale: locale === "en" ? "en" : "es",
    steps: [
      {
        step: "arrival_window",
        selection_mode: "single",
        options: [
          option("before_noon", 1, L("Antes del mediodía", "Before noon")),
          option("afternoon", 2, L("Tarde (12:00 – 17:00)", "Afternoon (12:00 – 5:00 pm)")),
          option("evening", 3, L("Noche (después de 17:00)", "Evening (after 5:00 pm)")),
          option("unknown", 4, L("Aún no lo sé", "I don’t know yet")),
        ],
      },
      {
        step: "stay_reason",
        selection_mode: "single",
        options: [
          option("rest", 1, L("Descanso", "Rest")),
          option("couple", 2, L("Pareja", "Couple")),
          option("anniversary", 3, L("Aniversario", "Anniversary")),
          option("birthday", 4, L("Cumpleaños", "Birthday")),
          option("family", 5, L("Familia", "Family")),
          option("remote_work", 6, L("Trabajo remoto", "Remote work")),
          option("retreat", 7, L("Retiro / bienestar", "Retreat / wellbeing")),
        ],
      },
      {
        step: "transfer",
        selection_mode: "single",
        options: [
          option("coordinate", 1, L("Sí, me gustaría coordinarlo", "Yes, I would like to arrange it")),
          option("own", 2, L("Llegaré por mi cuenta", "I will arrive on my own")),
          option("undecided", 3, L("Aún no lo decido", "I haven’t decided")),
        ],
      },
      {
        step: "scent",
        selection_mode: "single",
        options: [
          option("herbal", 1, L("Herbal & fresco", "Herbal & fresh", "Hierbabuena, eucalipto", "Mint, eucalyptus")),
          option("floral", 2, L("Floral suave", "Soft floral", "Jazmín, flor de azahar", "Jasmine, orange blossom")),
          option("woody", 3, L("Amaderado", "Woody", "Cedro, copal, sándalo", "Cedar, copal, sandalwood")),
          option("citrus", 4, L("Cítrico", "Citrus", "Lima, bergamota", "Lime, bergamot")),
          option("none", 5, L("Sin aroma", "No scent", "Prefiero el ambiente neutro", "I prefer a neutral room")),
        ],
      },
      {
        step: "pillow",
        selection_mode: "multi",
        options: [
          option("soft", 1, L("Suave / plumón", "Soft / down")),
          option("firm", 2, L("Firme", "Firm")),
          option("cervical", 3, L("Cervical / ortopédica", "Cervical / orthopedic")),
          option("hypoallergenic", 4, L("Hipoalergénica", "Hypoallergenic")),
        ],
      },
      {
        step: "comfort",
        selection_mode: "multi",
        options: [
          option("light_blanket", 1, L("Manta ligera", "Light blanket")),
          option("extra_blanket", 2, L("Manta extra", "Extra blanket")),
          option("cool_room", 3, L("Habitación fresca", "Cool room")),
          option("night_diffuser", 4, L("Difusor de noche", "Night diffuser")),
          option("sleep_kit", 5, L("Tapones / antifaz", "Earplugs / eye mask")),
        ],
      },
      {
        step: "allergy",
        selection_mode: "multi",
        options: [
          option("gluten", 1, L("Gluten", "Gluten")),
          option("dairy", 2, L("Lácteos", "Dairy")),
          option("nuts", 3, L("Frutos secos", "Tree nuts")),
          option("shellfish", 4, L("Mariscos", "Shellfish")),
          option("egg", 5, L("Huevo", "Egg")),
          option("soy", 6, L("Soya", "Soy")),
          option("none", 7, L("Ninguna", "None"), true),
        ],
      },
      {
        step: "diet",
        selection_mode: "multi",
        options: [
          option("vegetarian", 1, L("Vegetariana", "Vegetarian")),
          option("vegan", 2, L("Vegana", "Vegan")),
          option("no_sugar", 3, L("Sin azúcar", "No sugar")),
          option("keto", 4, L("Keto / baja en carbos", "Keto / low carb")),
          option("mediterranean", 5, L("Mediterránea", "Mediterranean")),
          option("no_preference", 6, L("Sin preferencia", "No preference"), true),
        ],
      },
      {
        step: "spa",
        selection_mode: "multi",
        options: [
          option("welcome_massage", 1, L("Masaje de bienvenida", "Welcome massage", "50 min · relajación profunda", "50 min · deep relaxation")),
          option("copal_ritual", 2, L("Ritual maya de copal", "Mayan copal ritual", "80 min · cuerpo y mente", "80 min · body and mind")),
          option("temazcal", 3, L("Temazcal al atardecer", "Sunset temazcal", "Ceremonia ancestral", "Ancestral ceremony")),
          option("lagoon_yoga", 4, L("Yoga frente a la laguna", "Lagoon yoga", "Al amanecer · 60 min", "At sunrise · 60 min")),
        ],
      },
      {
        step: "experience",
        selection_mode: "multi",
        options: [
          option("dawn_kayak", 1, L("Kayak al amanecer", "Sunrise kayak", "Sobre los siete colores", "Across the seven colors")),
          option("sail", 2, L("Navegación en velero", "Sailboat outing", "Recorrido por los cenotes", "Cenote route")),
          option("dock_dinner", 3, L("Cena privada en muelle", "Private dock dinner", "Al atardecer", "At sunset")),
          option("birdwatching", 4, L("Avistamiento de aves", "Birdwatching", "Tour guiado matutino", "Guided morning tour")),
        ],
      },
      {
        step: "celebration",
        selection_mode: "single",
        options: [
          option("none", 1, L("No, gracias", "No, thank you"), true),
          option("anniversary", 2, L("Aniversario", "Anniversary")),
          option("birthday", 3, L("Cumpleaños", "Birthday")),
          option("honeymoon", 4, L("Luna de miel", "Honeymoon")),
          option("bachelorette", 5, L("Despedida de soltera", "Bachelorette")),
          option("proposal", 6, L("Propuesta", "Proposal")),
          option("surprise", 7, L("Sorpresa", "Surprise")),
        ],
      },
    ],
  };
}

function codesFor(step) {
  const group = catalog("es").steps.find((item) => item.step === step);
  return new Set((group?.options || []).map((item) => item.code));
}

function assertCode(step, code) {
  if (code == null || code === "") return;
  if (!codesFor(step).has(code)) throw fail(400, "invalid_option");
}

function assertCodes(step, codes) {
  if (!Array.isArray(codes)) throw fail(400, "invalid_option");
  codes.forEach((code) => assertCode(step, code));
}

function normalizeExclusive(step, codes) {
  const group = catalog("es").steps.find((item) => item.step === step);
  const exclusive = new Set((group?.options || []).filter((item) => item.is_exclusive).map((item) => item.code));
  const picked = codes.filter((code, index) => codes.indexOf(code) === index);
  const exclusivePick = picked.find((code) => exclusive.has(code));
  if (exclusivePick && picked.length > 1) throw fail(400, "invalid_option");
  return picked;
}

function publicSubmission(record) {
  if (!record) return null;
  return {
    status: record.status,
    submitted_at: record.submitted_at,
    arrival_window: record.arrival_window,
    stay_reason: record.stay_reason,
    scent_code: record.scent_code,
    pillow_codes: record.pillow_codes,
    comfort_codes: record.comfort_codes,
    allergy_codes: record.allergy_codes,
    diet_codes: record.diet_codes,
    diet_notes: record.diet_notes,
    celebration_code: record.celebration_code,
    special_request: record.special_request,
    whatsapp: record.whatsapp,
    summary_email: record.summary_email,
    spa_codes: record.spa_codes,
    experience_codes: record.experience_codes,
  };
}

function blankSubmission() {
  return {
    status: "draft",
    submitted_at: null,
    arrival_window: null,
    stay_reason: null,
    airport_transfer: null,
    scent_code: null,
    pillow_codes: [],
    comfort_codes: [],
    allergy_codes: [],
    diet_codes: [],
    diet_notes: "",
    celebration_code: null,
    special_request: "",
    whatsapp: "",
    summary_email: null,
    spa_codes: [],
    experience_codes: [],
  };
}

function applyPayload(record, body) {
  assertCode("arrival_window", body.arrival_window);
  assertCode("stay_reason", body.stay_reason);
  assertCode("transfer", body.airport_transfer);
  assertCode("scent", body.scent_code);
  assertCodes("pillow", body.pillow_codes || []);
  assertCodes("comfort", body.comfort_codes || []);
  assertCodes("allergy", body.allergy_codes || []);
  assertCodes("diet", body.diet_codes || []);
  assertCodes("spa", body.spa_codes || []);
  assertCodes("experience", body.experience_codes || []);
  assertCode("celebration", body.celebration_code);

  record.arrival_window = body.arrival_window || null;
  record.stay_reason = body.stay_reason || null;
  record.airport_transfer = body.airport_transfer || null;
  record.scent_code = body.scent_code || null;
  record.pillow_codes = normalizeExclusive("pillow", body.pillow_codes || []);
  record.comfort_codes = normalizeExclusive("comfort", body.comfort_codes || []);
  record.allergy_codes = normalizeExclusive("allergy", body.allergy_codes || []);
  record.diet_codes = normalizeExclusive("diet", body.diet_codes || []);
  record.diet_notes = typeof body.diet_notes === "string" ? body.diet_notes : "";
  record.spa_codes = normalizeExclusive("spa", body.spa_codes || []);
  record.experience_codes = normalizeExclusive("experience", body.experience_codes || []);
  record.celebration_code = body.celebration_code || null;
  record.special_request = typeof body.special_request === "string" ? body.special_request : "";
  record.whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.slice(0, 40) : "";
}

function attempts() {
  return Number(sessionStorage.getItem(ATTEMPTS_KEY) || "0");
}

function setAttempts(value) {
  sessionStorage.setItem(ATTEMPTS_KEY, String(value));
}

function requireBooking(token) {
  const db = readDb();
  const session = db.tokens[token];
  if (!token) throw fail(401, "token_required");
  if (!session) throw fail(401, "token_invalid");
  if (session.exp < Date.now()) throw fail(401, "token_expired");
  const booking = db.bookings[session.code];
  if (!booking) throw fail(401, "token_invalid");
  return { db, booking };
}

function bookingView(booking) {
  return {
    reservation_number: booking.reservation_number,
    hotel_name: booking.hotel_name,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
  };
}

function lookup(body) {
  const guestName = String(body?.guest_name || "");
  const reservationCode = String(body?.reservation_code || "");
  if (!guestName.trim() || !reservationCode.trim()) throw fail(400, "missing_required_fields");
  if (attempts() >= ATTEMPT_LIMIT) throw fail(429, "too_many_attempts");

  const code = normalizeCode(reservationCode);
  const name = normalizeName(guestName);
  if (code.startsWith("CANCEL") || code.startsWith("PAST")) {
    throw fail(409, "booking_not_eligible");
  }

  const db = readDb();
  let booking = db.bookings[code];

  if (booking && booking.guest_name !== name) {
    setAttempts(attempts() + 1);
    throw fail(404, "booking_not_found");
  }

  if (!booking) {
    booking = {
      guest_name: name,
      reservation_number: reservationCode.trim(),
      hotel_name: "MÍA Bacalar",
      check_in_date: "2026-11-02",
      check_out_date: "2026-11-06",
      submission: null,
    };
    db.bookings[code] = booking;
  }

  const token = `pa_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  db.tokens[token] = { code, exp: Date.now() + 7200 * 1000 };
  writeDb(db);
  setAttempts(0);

  return {
    success: true,
    token,
    expires_in: 7200,
    booking: bookingView(booking),
    submission: publicSubmission(booking.submission),
  };
}

export async function mockRequest(path, { method = "GET", body, token, locale } = {}) {
  await delay(280);
  try {
    if (path === "/api/public/prearrival/lookup" && method === "POST") {
      return lookup(body);
    }
    if (path === "/api/public/prearrival/options" && method === "GET") {
      requireBooking(token);
      return catalog(locale);
    }
    if (path === "/api/public/prearrival/draft" && method === "PUT") {
      const { db, booking } = requireBooking(token);
      if (!booking.submission) booking.submission = blankSubmission();
      applyPayload(booking.submission, body || {});
      if (booking.submission.status !== "submitted") booking.submission.status = "draft";
      writeDb(db);
      return {
        success: true,
        status: booking.submission.status,
        submission: publicSubmission(booking.submission),
      };
    }
    if (path === "/api/public/prearrival/submission" && method === "GET") {
      const { booking } = requireBooking(token);
      return {
        success: true,
        data: publicSubmission(booking.submission) || { ...blankSubmission(), status: "draft" },
      };
    }
    if (path === "/api/public/prearrival/submit" && method === "POST") {
      const { db, booking } = requireBooking(token);
      if (!booking.submission) booking.submission = blankSubmission();
      applyPayload(booking.submission, body || {});
      const record = booking.submission;
      if (!record.arrival_window || !record.airport_transfer || !record.scent_code || !record.celebration_code) {
        throw fail(400, "missing_required_fields");
      }
      record.status = "submitted";
      record.submitted_at = new Date().toISOString();
      writeDb(db);
      return {
        success: true,
        status: "submitted",
        submitted_at: record.submitted_at,
      };
    }
    if (path === "/api/public/prearrival/email-copy" && method === "POST") {
      const { db, booking } = requireBooking(token);
      if (!booking.submission || booking.submission.status !== "submitted") {
        throw fail(409, "submission_not_finished");
      }
      const email = String(body?.email || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, "invalid_email");
      booking.submission.summary_email = email;
      writeDb(db);
      return { success: true, message: "summary_sent" };
    }
    throw fail(404, "request_failed");
  } catch (error) {
    if (error.code && error.status) {
      const wrapped = new Error(error.code);
      wrapped.status = error.status;
      wrapped.code = error.code;
      wrapped.name = "ApiError";
      throw wrapped;
    }
    throw error;
  }
}
