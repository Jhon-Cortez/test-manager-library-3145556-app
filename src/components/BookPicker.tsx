import { useEffect, useRef, useState } from "react";
import { listBooks } from "../api/endpoints";
import type { Book } from "../api/types";

interface BookPickerProps {
  onAdd: (book: Book) => void;
  excludeIds: string[];
}

export function BookPicker({ onAdd, excludeIds }: BookPickerProps) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    listBooks({ q, size: 8 })
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

  return (
    <div className="field picker" ref={wrapRef}>
      <label htmlFor="book-picker">Agregar libro (1 a 3)</label>
      <input
        id="book-picker"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar por título o autor"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="picker-list">
          {results.map((b) => {
            const already = excludeIds.includes(b.id);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={already || b.available_copies < 1}
                  onClick={() => {
                    onAdd(b);
                    setQ("");
                    setResults([]);
                    setOpen(false);
                  }}
                >
                  {b.title} · {b.author}
                  {already ? " (ya agregado)" : ` (${b.available_copies} disp.)`}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
