"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  clearToken,
  fetchOptions,
  fetchSubmission,
  getToken,
  isMockMode,
  lookupReservation,
  readLocale,
  saveDraft,
  sendEmailCopy,
  setToken,
  storeLocale,
  submitPreferences,
} from "@/lib/api";
import { text } from "@/lib/copy";
import {
  emptyForm,
  formFromSubmission,
  formatStay,
  payloadFromForm,
  stepBlocker,
  stepForMissing,
  unwrapSubmission,
} from "@/lib/form";
import { DoneScreen } from "./DoneScreen";
import { WelcomeScreen } from "./WelcomeScreen";
import { WizardScreen } from "./WizardScreen";

export default function PrearrivalApp() {
  const stageRef = useRef(null);
  const [locale, setLocale] = useState("es");
  const [screen, setScreen] = useState("welcome");
  const [step, setStep] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [reservationCode, setReservationCode] = useState("");
  const [booking, setBooking] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [switching, setSwitching] = useState(false);

  const copy = text(locale);

  useEffect(() => {
    setLocale(readLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    stageRef.current
      ?.querySelectorAll(".stage-pad, .welcome, .welcome-foot, .final, .final-body")
      .forEach((node) => {
        node.scrollTop = 0;
      });
  }, [screen, step]);

  function errorText(code) {
    return copy.errors[code] || copy.errors.request_failed;
  }

  function failAuth(caught) {
    const tokenError = ["token_required", "token_expired", "token_invalid"].includes(caught.code);
    if (!(caught instanceof ApiError) || caught.status !== 401 || !tokenError) return false;
    clearToken();
    setScreen("welcome");
    setStep(1);
    setError(errorText(caught.code));
    return true;
  }

  async function loadOptions(token, nextLocale) {
    const response = await fetchOptions(token, nextLocale);
    setCatalog(response);
    return response;
  }

  async function onLookup(event) {
    event.preventDefault();
    setError("");
    if (!guestName.trim() || !reservationCode.trim()) {
      setError(errorText("missing_required_fields"));
      return;
    }
    setPending(true);
    try {
      const response = await lookupReservation(guestName.trim(), reservationCode.trim());
      setToken(response.token);
      setBooking(response.booking);
      const saved = unwrapSubmission(response.submission);
      setForm(saved ? formFromSubmission(saved) : emptyForm());
      await loadOptions(response.token, locale);
      if (saved?.status === "submitted") {
        setScreen("done");
      } else {
        setStep(1);
        setScreen("wizard");
      }
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.code : "request_failed";
      setError(errorText(code));
    } finally {
      setPending(false);
    }
  }

  async function onLocale(next) {
    const value = next === "en" ? "en" : "es";
    storeLocale(value);
    setLocale(value);
    setError("");
    const token = getToken();
    if (!token || screen === "welcome") return;
    setSwitching(true);
    try {
      await loadOptions(token, value);
    } catch (caught) {
      if (!failAuth(caught)) {
        const code = caught instanceof ApiError ? caught.code : "request_failed";
        setError(errorText(code));
      }
    } finally {
      setSwitching(false);
    }
  }

  async function onNext() {
    setError("");
    const blocker = stepBlocker(step, form);
    if (blocker) {
      setError(errorText(blocker));
      return;
    }
    const token = getToken();
    if (!token) {
      clearToken();
      setScreen("welcome");
      setError(errorText("token_required"));
      return;
    }
    setPending(true);
    try {
      const payload = payloadFromForm(form);
      if (step < 7) {
        const response = await saveDraft(token, payload);
        const saved = unwrapSubmission(response.submission);
        if (saved) setForm(formFromSubmission(saved));
        setStep(step + 1);
      } else {
        await submitPreferences(token, payload);
        setScreen("done");
      }
    } catch (caught) {
      if (failAuth(caught)) return;
      const code = caught instanceof ApiError ? caught.code : "request_failed";
      if (code === "missing_required_fields") {
        const target = stepForMissing(form);
        setStep(target);
        setError(errorText(stepBlocker(target, form) || code));
        return;
      }
      setError(errorText(code));
    } finally {
      setPending(false);
    }
  }

  function onBack() {
    setError("");
    if (step === 1) {
      setScreen("welcome");
      return;
    }
    setStep(step - 1);
  }

  function onJump(target) {
    if (target >= step || target < 1) return;
    setError("");
    setStep(target);
  }

  async function onEdit() {
    setError("");
    const token = getToken();
    if (!token) {
      setScreen("welcome");
      setError(errorText("token_required"));
      return;
    }
    setPending(true);
    try {
      const response = await fetchSubmission(token);
      setForm(formFromSubmission(response.data));
      setStep(1);
      setScreen("wizard");
    } catch (caught) {
      if (!failAuth(caught)) {
        const code = caught instanceof ApiError ? caught.code : "request_failed";
        setError(errorText(code));
      }
    } finally {
      setPending(false);
    }
  }

  async function onSendEmail(email) {
    const token = getToken();
    if (!token) {
      setScreen("welcome");
      setError(errorText("token_required"));
      return { ok: false };
    }
    setPending(true);
    try {
      await sendEmailCopy(token, email);
      return { ok: true };
    } catch (caught) {
      if (failAuth(caught)) return { ok: false };
      const code = caught instanceof ApiError ? caught.code : "request_failed";
      return { ok: false, message: errorText(code) };
    } finally {
      setPending(false);
    }
  }

  const stayLine = booking
    ? [booking.hotel_name, formatStay(booking.check_in_date, booking.check_out_date, locale)]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <main className="app" ref={stageRef}>
      {screen === "welcome" ? (
        <WelcomeScreen
          copy={copy}
          locale={locale}
          onLocale={onLocale}
          guestName={guestName}
          reservationCode={reservationCode}
          onGuestName={(value) => {
            setGuestName(value);
            setError("");
          }}
          onReservationCode={(value) => {
            setReservationCode(value);
            setError("");
          }}
          onSubmit={onLookup}
          pending={pending}
          error={error}
          mock={isMockMode()}
        />
      ) : null}
      {screen === "wizard" ? (
        <WizardScreen
          copy={copy}
          locale={locale}
          onLocale={onLocale}
          step={step}
          bookingStay={stayLine}
          catalog={catalog}
          form={form}
          onForm={(next) => {
            setForm(next);
            setError("");
          }}
          error={error}
          pending={pending}
          switching={switching}
          onBack={onBack}
          onJump={onJump}
          onNext={onNext}
        />
      ) : null}
      {screen === "done" ? (
        <DoneScreen
          copy={copy}
          locale={locale}
          booking={booking}
          catalog={catalog}
          form={form}
          pending={pending}
          onEdit={onEdit}
          onSendEmail={onSendEmail}
        />
      ) : null}
    </main>
  );
}
