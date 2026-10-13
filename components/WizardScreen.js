"use client";

import { optionsFor, selectionMode, toggleCode } from "@/lib/form";
import { Arrow } from "./Icon";
import { LocaleSwitch } from "./WelcomeScreen";
import { ChipGroup, SelectField } from "./Choices";
import { PhoneField } from "./PhoneField";

export function WizardScreen({
  copy,
  locale,
  onLocale,
  step,
  bookingStay,
  catalog,
  form,
  onForm,
  error,
  pending,
  switching,
  onBack,
  onJump,
  onNext,
}) {
  const meta = copy.steps[step];
  const progress = `${(step / 7) * 100}%`;

  function patch(partial) {
    onForm({ ...form, ...partial });
  }

  function toggle(field, stepName) {
    return (code) => {
      const options = optionsFor(catalog, stepName);
      patch({ [field]: toggleCode(form[field], code, options) });
    };
  }

  return (
    <>
      <aside className="rail">
        <img className="rail-logo" src="/logo.avif" alt="MÍA Bacalar" />
        <p className="rail-kicker">{copy.wizardKicker}</p>
        {bookingStay ? <p className="rail-stay">{bookingStay}</p> : null}
        <ol className="rail-steps" aria-label={copy.stepsLabel}>
          {[1, 2, 3, 4, 5, 6, 7].map((number) => {
            const state = number < step ? "done" : number === step ? "current" : "upcoming";
            return (
              <li key={number}>
                <button
                  type="button"
                  className={`rail-step ${state}`}
                  aria-current={number === step ? "step" : undefined}
                  disabled={number > step || pending || switching}
                  onClick={() => onJump(number)}
                >
                  <span className="rail-index" aria-hidden="true">
                    {number < step ? "✓" : number}
                  </span>
                  <span className="rail-copy">
                    <small>
                      {number} / 7
                    </small>
                    {copy.steps[number].label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <LocaleSwitch locale={locale} onChange={onLocale} label={copy.langLabel} tone="light" />
      </aside>
      <div className="wizard-main">
      <header className="top">
        <LocaleSwitch locale={locale} onChange={onLocale} label={copy.langLabel} />
        <div className="brand">
          <img className="logo-top" src="/logo.avif" alt="MÍA Bacalar" />
        </div>
        <div className="progress">
          <span style={{ width: progress }} />
        </div>
        <div className="step-label">
          <span>{meta.label}</span>
          <span>
            {step} / 7
          </span>
        </div>
        {bookingStay ? <p className="stay-line">{bookingStay}</p> : null}
      </header>
      <div className="stage-pad">
        <section className="screen active" key={step}>
          <div className="eyebrow">{meta.eyebrow}</div>
          <h2>{meta.title}</h2>
          <p className="hint">{meta.hint}</p>
          {error ? (
            <p className="banner" role="alert">
              {error}
            </p>
          ) : null}
          <StepFields
            step={step}
            copy={copy}
            locale={locale}
            catalog={catalog}
            form={form}
            patch={patch}
            toggle={toggle}
          />
        </section>
      </div>
      <nav className="nav">
        <button className="btn btn-ghost" type="button" onClick={onBack} disabled={pending || switching}>
          <Arrow direction="left" /> {copy.back}
        </button>
        <button className="btn btn-primary" type="button" onClick={onNext} disabled={pending || switching}>
          {pending ? (step === 7 ? copy.finishing : copy.saving) : step === 7 ? copy.finish : copy.continue}{" "}
          <Arrow />
        </button>
      </nav>
      </div>
    </>
  );
}

function StepFields({ step, copy, locale, catalog, form, patch, toggle }) {
  if (step === 1) {
    return (
      <>
        <SelectField
          id="arrival-window"
          label={copy.arrivalLabel}
          placeholder={copy.arrivalPlaceholder}
          value={form.arrival_window}
          options={optionsFor(catalog, "arrival_window")}
          onChange={(value) => patch({ arrival_window: value })}
        />
        <SelectField
          id="stay-reason"
          label={copy.groups.stay_reason.label}
          hint={copy.groups.stay_reason.sub}
          placeholder={copy.transferPlaceholder}
          value={form.stay_reason}
          options={optionsFor(catalog, "stay_reason")}
          onChange={(value) => patch({ stay_reason: value })}
        />
        <SelectField
          id="airport-transfer"
          label={copy.transferLabel}
          placeholder={copy.transferPlaceholder}
          value={form.airport_transfer}
          options={optionsFor(catalog, "transfer")}
          onChange={(value) => patch({ airport_transfer: value })}
        />
      </>
    );
  }

  if (step === 2) {
    return (
      <OptionBlock
        catalog={catalog}
        stepName="scent"
        field="scent_code"
        label={copy.steps[2].label}
        placeholder={copy.transferPlaceholder}
        copy={copy}
        form={form}
        patch={patch}
        toggle={toggle}
      />
    );
  }

  if (step === 3) {
    return (
      <>
        <OptionBlock
          catalog={catalog}
          stepName="pillow"
          field="pillow_codes"
          label={copy.groups.pillow.label}
          sub={copy.groups.pillow.sub}
          copy={copy}
          form={form}
          patch={patch}
          toggle={toggle}
        />
        <OptionBlock
          catalog={catalog}
          stepName="comfort"
          field="comfort_codes"
          label={copy.groups.comfort.label}
          sub={copy.groups.comfort.sub}
          copy={copy}
          form={form}
          patch={patch}
          toggle={toggle}
        />
      </>
    );
  }

  if (step === 4) {
    return (
      <>
        <OptionBlock
          catalog={catalog}
          stepName="allergy"
          field="allergy_codes"
          label={copy.groups.allergy.label}
          sub={copy.groups.allergy.sub}
          copy={copy}
          form={form}
          patch={patch}
          toggle={toggle}
        />
        <OptionBlock
          catalog={catalog}
          stepName="diet"
          field="diet_codes"
          label={copy.groups.diet.label}
          sub={copy.groups.diet.sub}
          copy={copy}
          form={form}
          patch={patch}
          toggle={toggle}
        />
        <div className="field">
          <label htmlFor="diet-notes">{copy.dietNotesLabel}</label>
          <textarea
            id="diet-notes"
            value={form.diet_notes}
            placeholder={copy.dietNotesPlaceholder}
            onChange={(event) => patch({ diet_notes: event.target.value })}
          />
        </div>
      </>
    );
  }

  if (step === 5) {
    return (
      <OptionBlock
        catalog={catalog}
        stepName="spa"
        field="spa_codes"
        copy={copy}
        form={form}
        patch={patch}
        toggle={toggle}
      />
    );
  }

  if (step === 6) {
    return (
      <OptionBlock
        catalog={catalog}
        stepName="experience"
        field="experience_codes"
        copy={copy}
        form={form}
        patch={patch}
        toggle={toggle}
      />
    );
  }

  return (
    <>
      <OptionBlock
        catalog={catalog}
        stepName="celebration"
        field="celebration_code"
        label={copy.summary.celebration}
        placeholder={copy.transferPlaceholder}
        copy={copy}
        form={form}
        patch={patch}
        toggle={toggle}
      />
      <div className="field">
        <label htmlFor="special-request">{copy.requestLabel}</label>
        <textarea
          id="special-request"
          value={form.special_request}
          placeholder={copy.requestPlaceholder}
          onChange={(event) => patch({ special_request: event.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="whatsapp">{copy.whatsappLabel}</label>
        <PhoneField
          id="whatsapp"
          locale={locale}
          placeholder={copy.whatsappPlaceholder}
          value={form.whatsapp}
          onChange={(next) => patch({ whatsapp: String(next || "").slice(0, 40) })}
        />
      </div>
    </>
  );
}

function OptionBlock({ catalog, stepName, field, label, sub, placeholder, copy, form, patch, toggle }) {
  const options = optionsFor(catalog, stepName);
  if (selectionMode(catalog, stepName) === "single") {
    return (
      <SelectField
        id={stepName}
        label={label}
        placeholder={placeholder || copy.transferPlaceholder}
        options={options}
        value={form[field]}
        onChange={(value) => patch({ [field]: value })}
      />
    );
  }
  return (
    <ChipGroup
      label={label}
      sub={sub}
      options={options}
      selected={Array.isArray(form[field]) ? form[field] : []}
      onToggle={toggle(field, stepName)}
      emptyLabel={copy.emptyOptions}
    />
  );
}
