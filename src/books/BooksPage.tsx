import { useEffect, useState, type FormEvent } from "react";
import { listBooks, listCategories } from "../api/endpoints";
import { ApiError } from "../api/client";
import type { Book, Category } from "../api/types";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 20;

export function BooksPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    listBooks({ q, category_id: categoryId, page, size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "No se pudo cargar el catálogo.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, categoryId, page]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
  }

  return (
    <section>
      <h1>Catálogo de libros</h1>

      <form className="filters" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Buscar por título o autor"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          aria-label="Buscar libros"
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </form>

      {error && <p className="error">{error}</p>}
      {busy && <p className="muted">Cargando…</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th>Categoría</th>
              <th>Disponibles</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td className="mono">{b.isbn}</td>
                <td>{b.category.name}</td>
                <td>
                  {b.available_copies} / {b.total_copies}
                </td>
              </tr>
            ))}
            {!busy && items.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
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
