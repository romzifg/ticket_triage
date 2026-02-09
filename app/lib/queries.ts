import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Fetch all tickets
export const useTickets = () => {
    return useQuery({
        queryKey: ["tickets"],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/tickets`);
            if (!res.ok) throw new Error("Failed to fetch tickets");
            return res.json();
        },
    });
};

// Fetch single ticket
export const useTicket = (id: string) => {
    return useQuery({
        queryKey: ["ticket", id],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/tickets/${id}`);
            if (!res.ok) throw new Error("Failed to fetch ticket");
            return res.json();
        },
        enabled: !!id,
    });
};

// Create ticket
export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { email: string; message: string }) => {
            const res = await fetch(`${API_URL}/tickets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create ticket");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
};

// Update draft - FIXED
export const useUpdateDraft = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { draft: string }) => {
            const res = await fetch(`${API_URL}/tickets/${id}/draft`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ai_draft: data.draft }), // Match backend schema
            });
            if (!res.ok) throw new Error("Failed to update draft");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id] });
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
};

// Resolve ticket
export const useResolveTicket = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/tickets/${id}/resolve`, {
                method: "PATCH",
            });
            if (!res.ok) throw new Error("Failed to resolve ticket");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id] });
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
};

// Delete ticket - NEW
export const useDeleteTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`${API_URL}/tickets/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete ticket");
            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
};

// Reopen ticket - BONUS
export const useReopenTicket = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/tickets/${id}/reopen`, {
                method: "PATCH",
            });
            if (!res.ok) throw new Error("Failed to reopen ticket");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", id] });
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
};