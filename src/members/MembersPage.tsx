import { useEffect, useState, type FormEvent } from "react";
import { createMember, listMembers } from "../api/endpoints";
import { ApiError } from "../api/client";
import type { Member } from "../api/types";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 20;

export function MembersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    listMembers({ q, page, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "No se pudo cargar los socios.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, page]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await createMember({ full_name: fullName, document_number: documentNumber });
      setFullName("");
      setDocumentNumber("");
      setPage(1);
      setQ("");
      const res = await listMembers({ page: 1, size: PAGE_SIZE });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo crear el socio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1>Socios</h1>

      <form className="card form" onSubmit={handleCreate}>
        <h2>Nuevo socio</h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="full_name">Nombre completo</label>
            <input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="document_number">Documento</label>
            <input
              id="document_number"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Crear socio"}
          </button>
        </div>
        {formError && <p className="error">{formError}</p>}
      </form>

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <input
          type="search"
          placeholder="Buscar por nombre o documento"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          aria-label="Buscar socios"
        />
      </form>

      {error && <p className="error">{error}</p>}
      {busy && <p className="muted">Cargando…</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Préstamos activos</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.full_name}</td>
                <td className="mono">{m.document_number}</td>
                <td>{m.active_loans ?? "—"}</td>
              </tr>
            ))}
            {!busy && items.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">
                  Sin resultados.
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
