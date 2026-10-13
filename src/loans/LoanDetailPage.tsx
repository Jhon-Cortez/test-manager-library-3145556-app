import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { getLoan, returnLoanItem } from "../api/endpoints";
import type { Loan } from "../api/types";
import { formatDateTime, statusLabel } from "../lib/format";

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      setLoan(await getLoan(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el préstamo.");
    } finally {
      setBusy(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReturn(itemId: string) {
    if (!loan) return;
    setActionError(null);
    try {
      await returnLoanItem(loan.id, itemId);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "No se pudo devolver la línea.");
    }
  }

  if (busy && !loan) return <p className="muted">Cargando…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!loan) return null;

  return (
    <section>
      <div className="page-head">
        <h1>Préstamo</h1>
        <Link to="/loans">← Volver al listado</Link>
      </div>

      <div className="card">
        <p>
          <strong>Fecha:</strong> {formatDateTime(loan.loaned_at)}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <span className={`badge badge-${loan.status}`}>{statusLabel(loan.status)}</span>
        </p>
        {loan.member_name && (
          <p>
            <strong>Socio:</strong> {loan.member_name}
          </p>
        )}
      </div>

      {actionError && <p className="error">{actionError}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>ISBN</th>
              <th>Categoría</th>
              <th>Vence</th>
              <th>Devuelto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loan.items.map((item) => (
              <tr key={item.id}>
                <td>{item.book_title}</td>
                <td className="mono">{item.isbn}</td>
                <td>{item.category_name}</td>
                <td>{formatDateTime(item.due_at)}</td>
                <td>{item.returned_at ? formatDateTime(item.returned_at) : "—"}</td>
                <td>
                  {!item.returned_at && (
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => handleReturn(item.id)}
                    >
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
