"use client";

import PhoneInput, { formatPhoneNumberIntl } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import es from "react-phone-number-input/locale/es";
import "react-phone-number-input/style.css";

const LABELS = { es, en };

export function formatWhatsApp(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return formatPhoneNumberIntl(trimmed) || trimmed;
}

export function PhoneField({ id, locale, value, onChange, placeholder }) {
  const country = locale === "en" ? "US" : "MX";
  return (
    <PhoneInput
      key={country}
      id={id}
      className="phone-field"
      international
      countryCallingCodeEditable={false}
      limitMaxLength
      defaultCountry={country}
      labels={LABELS[country === "US" ? "en" : "es"]}
      placeholder={placeholder}
      value={value || undefined}
      onChange={(next) => onChange(next || "")}
      autoComplete="tel"
    />
  );
}
