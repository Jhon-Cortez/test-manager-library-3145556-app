import { useState, type FormEvent } from "react";
import { ApiError } from "../api/client";
import { mostBorrowed } from "../api/endpoints";
import type { MostBorrowedReport } from "../api/types";

export function ReportPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<MostBorrowedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setReport(await mostBorrowed(from, to));
    } catch (err) {
      setReport(null);
      setError(err instanceof ApiError ? err.message : "No se pudo generar el reporte.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>Libros más prestados</h1>
      <p className="muted">
        Una fila por libro y categoría congelados. Solo administradores.
      </p>

      <form className="filters" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="from">Desde</label>
          <input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="to">Hasta</label>
          <input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Generando…" : "Generar reporte"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {report && (
        <>
          <p className="muted">
            Periodo: {report.from} a {report.to} · {report.rows.length} filas
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Libro</th>
                  <th>Categoría</th>
                  <th>Veces prestado</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.book_id}>
                    <td>{row.book_title}</td>
                    <td>{row.category_name}</td>
                    <td>{row.times_borrowed}</td>
                  </tr>
                ))}
                {report.rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="muted">
                      Sin préstamos en el periodo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
