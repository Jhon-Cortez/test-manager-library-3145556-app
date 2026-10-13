import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { createLoan } from "../api/endpoints";
import type { Book, Member } from "../api/types";
import { BookPicker } from "../components/BookPicker";
import { MemberPicker } from "../components/MemberPicker";

export function NewLoanPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function addBook(book: Book) {
    if (books.length >= 3) return;
    if (books.some((b) => b.id === book.id)) return;
    setBooks([...books, book]);
  }

  function removeBook(id: string) {
    setBooks(books.filter((b) => b.id !== id));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!member) {
      setError("Seleccione un socio.");
      return;
    }
    if (books.length < 1) {
      setError("Agregue al menos un libro.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const loan = await createLoan({
        member_id: member.id,
        items: books.map((b) => ({ book_id: b.id })),
      });
      navigate(`/loans/${loan.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el préstamo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>Nuevo préstamo</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <MemberPicker value={member} onSelect={setMember} required />

        {books.length > 0 && (
          <ul className="chip-list">
            {books.map((b) => (
              <li key={b.id} className="chip">
                <span>{b.title}</span>
                <button type="button" onClick={() => removeBook(b.id)} aria-label="Quitar libro">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {books.length < 3 && (
          <BookPicker onAdd={addBook} excludeIds={books.map((b) => b.id)} />
        )}

        <p className="muted">
          {books.length} de 3 libros · el vencimiento es a 14 días.
        </p>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={busy || !member || books.length < 1}>
          {busy ? "Registrando…" : "Registrar préstamo"}
        </button>
      </form>
    </section>
  );
}
