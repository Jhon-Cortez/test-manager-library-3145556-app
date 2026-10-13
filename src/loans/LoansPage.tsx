import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { listLoans } from "../api/endpoints";
import type { Loan } from "../api/types";
import { MemberPicker } from "../components/MemberPicker";
import { Pagination } from "../components/Pagination";
import { formatDateTime, statusLabel } from "../lib/format";
import type { Member } from "../api/types";

const PAGE_SIZE = 20;

export function LoansPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Loan[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    listLoans({
      from: from || undefined,
      to: to || undefined,
      status: status || undefined,
      member_id: member?.id,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "No se pudo cargar los préstamos.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, status, member, page]);

  return (
    <section>
      <div className="page-head">
        <h1>Préstamos</h1>
        <Link className="btn" to="/loans/new">
          Nuevo préstamo
        </Link>
      </div>

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <div className="field">
          <label htmlFor="from">Desde</label>
          <input
            id="from"
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="to">Hasta</label>
          <input
            id="to"
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="overdue">Vencido</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
        <MemberPicker value={member} onSelect={(m) => { setMember(m); setPage(1); }} />
      </form>

      {error && <p className="error">{error}</p>}
      {busy && <p className="muted">Cargando…</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Socio</th>
              <th>Estado</th>
              <th>Líneas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((loan) => (
              <tr key={loan.id}>
                <td>{formatDateTime(loan.loaned_at)}</td>
                <td>{loan.member_name ?? loan.member_id.slice(0, 8)}</td>
                <td>
                  <span className={`badge badge-${loan.status}`}>
                    {statusLabel(loan.status)}
                  </span>
                </td>
                <td>{loan.items.length}</td>
                <td>
                  <Link to={`/loans/${loan.id}`}>Ver detalle</Link>
                </td>
              </tr>
            ))}
            {!busy && items.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  Sin préstamos en este rango.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} size={PAGE_SIZE} total={total} onChange={setPage} />
    </section>
  );
}
