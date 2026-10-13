import { useEffect, useRef, useState } from "react";
import { listMembers } from "../api/endpoints";
import type { Member } from "../api/types";

interface MemberPickerProps {
  value: Member | null;
  onSelect: (member: Member | null) => void;
  label?: string;
  required?: boolean;
}

export function MemberPicker({ value, onSelect, label = "Socio", required }: MemberPickerProps) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    listMembers({ q, size: 8 })
      .then((res) => {
        if (!cancelled) setResults(res.items);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  if (value) {
    return (
      <div className="field">
        <span className="field-label">{label}</span>
        <div className="picker-selected">
          <span>
            {value.full_name} · {value.document_number}
          </span>
          <button type="button" className="linkish" onClick={() => onSelect(null)}>
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="field picker" ref={wrapRef}>
      <label htmlFor="member-picker">{label}</label>
      <input
        id="member-picker"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar por nombre o documento"
        autoComplete="off"
        required={required}
      />
      {open && results.length > 0 && (
        <ul className="picker-list">
          {results.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(m);
                  setQ("");
                  setResults([]);
                  setOpen(false);
                }}
              >
                {m.full_name} · {m.document_number}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && q.trim() && results.length === 0 && (
        <ul className="picker-list">
          <li className="muted">Sin coincidencias</li>
        </ul>
      )}
    </div>
  );
}
