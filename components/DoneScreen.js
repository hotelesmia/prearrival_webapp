"use client";

import { useState } from "react";
import { formatStay, isValidEmail, labelFor, labelsFor } from "@/lib/form";
import { formatWhatsApp } from "./PhoneField";
import { Check } from "./Icon";

export function DoneScreen({ copy, locale, booking, catalog, form, pending, onEdit, onSendEmail }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");

  const stay = formatStay(booking?.check_in_date, booking?.check_out_date, locale);
  const rows = [
    [copy.summary.stay, stay],
    [copy.summary.arrival, labelFor(catalog, "arrival_window", form.arrival_window)],
    [copy.summary.reasons, labelFor(catalog, "stay_reason", form.stay_reason)],
    [copy.summary.transfer, labelFor(catalog, "transfer", form.airport_transfer)],
    [copy.summary.scent, labelFor(catalog, "scent", form.scent_code)],
    [copy.summary.pillows, labelsFor(catalog, "pillow", form.pillow_codes)],
    [copy.summary.comfort, labelsFor(catalog, "comfort", form.comfort_codes)],
    [copy.summary.allergies, labelsFor(catalog, "allergy", form.allergy_codes)],
    [copy.summary.diet, labelsFor(catalog, "diet", form.diet_codes)],
    [copy.summary.notes, form.diet_notes?.trim()],
    [copy.summary.spa, labelsFor(catalog, "spa", form.spa_codes)],
    [copy.summary.experiences, labelsFor(catalog, "experience", form.experience_codes)],
    [copy.summary.celebration, labelFor(catalog, "celebration", form.celebration_code)],
    [copy.summary.request, form.special_request?.trim()],
    [copy.summary.whatsapp, formatWhatsApp(form.whatsapp)],
  ].filter(([, value]) => value);

  async function submitEmail(event) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setMessage(copy.errors.invalid_email);
      return;
    }
    setMessage("");
    const result = await onSendEmail(email.trim());
    if (result?.ok) {
      setSentTo(email.trim());
      return;
    }
    setMessage(result?.message || copy.errors.request_failed);
  }

  return (
    <section className="screen final active">
      <div className="final-hero">
        <img src="/hero-dock.jpg" alt="Muelle MÍA Bacalar sobre la laguna" />
      </div>
      <div className="final-body">
      <div className="done">
        <div className="check-soft">
          <Check />
        </div>
        <div className="eyebrow">{copy.doneEyebrow}</div>
        <h2>
          {copy.doneTitle.split("\n").map((line, index, lines) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h2>
        <p className="lead">{copy.doneLead}</p>
      </div>
      <div className="summary">
        {rows.map(([key, value]) => (
          <div className="srow" key={key}>
            <span className="k">{key}</span>
            <span className="v">{value}</span>
          </div>
        ))}
      </div>
      <p className="note">{copy.conciergeNote}</p>
      <form className="email-box" onSubmit={submitEmail}>
        {sentTo ? (
          <div className="email-sent" role="status">
            <div className="check-soft" aria-hidden="true">
              <Check />
            </div>
            <div className="eb-label">{copy.emailSent}</div>
            <p className="eb-sub">{copy.emailSentDetail.replace("{email}", sentTo)}</p>
            <button className="btn btn-ghost email-again" type="button" onClick={() => setSentTo("")}>
              {copy.emailAgain}
            </button>
          </div>
        ) : (
          <>
            <div className="eb-label">{copy.emailTitle}</div>
            <div className="eb-sub">{copy.emailSub}</div>
            <input
              id="summary-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
              }}
              aria-invalid={message ? true : undefined}
              aria-describedby={message ? "emailMsg" : undefined}
            />
            <button className="btn btn-primary btn-full" type="button" onClick={submitEmail} disabled={pending} style={{ marginTop: 12 }}>
              {pending ? copy.emailSending : copy.emailButton}
            </button>
            {message ? (
              <p id="emailMsg" className="banner" role="alert">
                {message}
              </p>
            ) : null}
          </>
        )}
      </form>
      <button className="btn btn-ghost btn-full edit-link" type="button" onClick={onEdit} disabled={pending}>
        {pending ? copy.loadingEdit : copy.edit}
      </button>
      </div>
    </section>
  );
}
