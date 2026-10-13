import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { listOverdue } from "../api/endpoints";
import type { OverdueItem } from "../api/types";
import { formatDateTime } from "../lib/format";

export function OverduePage() {
  const [items, setItems] = useState<OverdueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    listOverdue()
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "No se pudo cargar los vencidos.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h1>Libros vencidos</h1>
      <p className="muted">Líneas sin devolver con vencimiento anterior a hoy.</p>

      {error && <p className="error">{error}</p>}
      {busy && <p className="muted">Cargando…</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Socio</th>
              <th>Venció</th>
              <th>Días de retraso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.item_id}>
                <td>{it.book_title}</td>
                <td>{it.member_name}</td>
                <td>{formatDateTime(it.due_at)}</td>
                <td>{it.days_late}</td>
                <td>
                  <Link to={`/loans/${it.loan_id}`}>Ver préstamo</Link>
                </td>
              </tr>
            ))}
            {!busy && items.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No hay libros vencidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
