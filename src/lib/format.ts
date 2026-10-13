export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

export function statusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Abierto";
    case "overdue":
      return "Vencido";
    case "closed":
      return "Cerrado";
    default:
      return status;
  }
}
