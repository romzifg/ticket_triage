const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function getTicket(id: string) {
  const res = await fetch(`${API_URL}/tickets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch ticket");
  return res.json();
}

export async function createTicket(payload: {
  email: string;
  message: string;
}) {
  const res = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
}

export async function updateTicketDraft(
  id: string,
  ai_draft: string
) {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ai_draft }),
  });

  if (!res.ok) throw new Error("Failed to update draft");
  return res.json();
}

export async function resolveTicket(id: string) {
  const res = await fetch(`${API_URL}/tickets/${id}/resolve`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to resolve ticket");
  return res.json();
}

