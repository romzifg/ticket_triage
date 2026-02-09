import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, getTicket, createTicket, updateTicketDraft, resolveTicket } from "./api";

/* ===== LIST TICKETS ===== */
export function useTickets() {
    return useQuery({
        queryKey: ["tickets"],
        queryFn: getTickets,
    });
}

/* ===== TICKET DETAIL ===== */
export function useTicket(id: string) {
    return useQuery({
        queryKey: ["tickets", id],
        queryFn: () => getTicket(id),
        enabled: !!id,
    });
}

/* ===== CREATE TICKET ===== */
export function useCreateTicket() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useUpdateDraft(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (draft: string) =>
            updateTicketDraft(id, draft),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["ticket", id] });
            qc.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}

export function useResolveTicket(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => resolveTicket(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["ticket", id] });
            qc.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
}
