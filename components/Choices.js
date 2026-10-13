"use client";

import { Icon, Check } from "./Icon";

export function SelectField({ id, label, hint, value, onChange, options, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="field-hint">{hint}</p> : null}
      <select id={id} value={value || ""} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.subtitle ? `${option.label} · ${option.subtitle}` : option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ChipGroup({ label, sub, options, selected, onToggle, emptyLabel, single = false }) {
  return (
    <div className="group">
      {label ? <div className="glabel">{label}</div> : null}
      {sub ? <div className="gsub">{sub}</div> : null}
      {options.length === 0 ? (
        <p className="hint">{emptyLabel}</p>
      ) : (
        <div className="chips" role={single ? "radiogroup" : undefined} aria-label={single ? label : undefined}>
          {options.map((option) => {
            const on = selected.includes(option.code);
            return (
              <button
                key={option.code}
                type="button"
                className={on ? "chip sel" : "chip"}
                role={single ? "radio" : undefined}
                aria-checked={single ? on : undefined}
                aria-pressed={single ? undefined : on}
                onClick={() => onToggle(option.code)}
              >
                <span>{option.label}</span>
                {option.subtitle ? <small>{option.subtitle}</small> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CardGroup({ options, isSelected, onSelect, emptyLabel }) {
  if (options.length === 0) return <p className="hint">{emptyLabel}</p>;
  return (
    <div className="opts">
      {options.map((option) => {
        const on = isSelected(option.code);
        return (
          <button
            key={option.code}
            type="button"
            className={on ? "opt sel" : "opt"}
            aria-pressed={on}
            onClick={() => onSelect(option.code)}
          >
            <span className="ico">
              <Icon name={option.code} />
            </span>
            <span className="txt">
              <strong>{option.label}</strong>
              {option.subtitle ? <span>{option.subtitle}</span> : null}
            </span>
            <span className="tick">
              <Check />
            </span>
          </button>
        );
      })}
    </div>
  );
}
