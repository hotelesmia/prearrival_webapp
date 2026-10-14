"use client";

import { Arrow } from "./Icon";

export function LocaleSwitch({ locale, onChange, label, tone = "dark" }) {
  const english = locale === "en";
  return (
    <div className={`locale ${tone}`}>
      <div className={`locale-switch ${english ? "en" : "es"}`} role="radiogroup" aria-label={label}>
        <span className="locale-thumb" aria-hidden="true" />
        <button type="button" role="radio" aria-checked={!english} className={english ? "" : "on"} onClick={() => onChange("es")}>
          ES
        </button>
        <button type="button" role="radio" aria-checked={english} className={english ? "on" : ""} onClick={() => onChange("en")}>
          EN
        </button>
      </div>
    </div>
  );
}

export function WelcomeScreen({
  copy,
  locale,
  onLocale,
  guestName,
  reservationCode,
  onGuestName,
  onReservationCode,
  onSubmit,
  pending,
  error,
  mock,
}) {
  return (
    <section className="screen welcome active">
      <div className="hero">
        <div className="hero-bg">
          <img src="/DRON%20BACALAR.webp" alt="Vista aérea de MÍA Bacalar sobre la laguna" />
        </div>
        <div className="brand-top">
          <LocaleSwitch locale={locale} onChange={onLocale} label={copy.langLabel} tone="light" />
          <img className="logo-hero" src="/logo.avif" alt="MÍA Bacalar México" />
          <div className="tagline">{copy.tagline}</div>
        </div>
        <div className="hero-content">
          <h1>
            {copy.welcomeTitle.split("\n").map((line, index, lines) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p>{copy.welcomeLead}</p>
        </div>
      </div>
      <form className="welcome-foot" onSubmit={onSubmit}>
        <div className="meta">
          <div>
            {copy.estimated}
            <b>{copy.minutes}</b>
          </div>
          <div>
            {copy.reservation}
            <b>{copy.confirmed}</b>
          </div>
        </div>
        <div className="field">
          <label htmlFor="guest-name">{copy.nameLabel}</label>
          <input
            id="guest-name"
            type="text"
            placeholder={copy.namePlaceholder}
            autoComplete="name"
            value={guestName}
            onChange={(event) => onGuestName(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="reservation-code">{copy.codeLabel}</label>
          <input
            id="reservation-code"
            type="text"
            placeholder={copy.codePlaceholder}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={reservationCode}
            onChange={(event) => onReservationCode(event.target.value)}
          />
          <p className="field-hint">{copy.codeHint}</p>
        </div>
        {error ? (
          <p className="banner" role="alert">
            {error}
          </p>
        ) : null}
        <button className="btn btn-primary btn-full" type="button" onClick={onSubmit} disabled={pending}>
          {pending ? copy.searching : copy.start} <Arrow />
        </button>
        {mock ? <p className="mock-note">{copy.mockNote}</p> : null}
      </form>
    </section>
  );
}
