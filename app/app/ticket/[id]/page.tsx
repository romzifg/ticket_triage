"use client";

import { use, useEffect, useState } from "react";
import {
    useTicket,
    useUpdateDraft,
    useResolveTicket,
} from "@/lib/queries";
import Link from "next/link";

export default function TicketDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Unwrap params menggunakan React.use()
    const { id } = use(params);

    const { data: ticket, isLoading } = useTicket(id);
    const updateDraft = useUpdateDraft(id);
    const resolve = useResolveTicket(id);

    const [draft, setDraft] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (ticket?.ai_draft) {
            setDraft(ticket.ai_draft);
        }
    }, [ticket]);

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            // await updateDraft.mutateAsync({ draft: draft });
        } catch (error) {
            console.error('Failed to save draft:', error);
        } finally {
            setTimeout(() => setIsSaving(false), 1000);
        }
    };

    const handleResolve = async () => {
        if (confirm("Are you sure you want to resolve this ticket?")) {
            await resolve.mutateAsync();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading ticket...</p>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 max-w-md">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">❌</span>
                        <div>
                            <p className="text-red-700 font-medium">Ticket not found</p>
                            <p className="text-sm text-red-600 mt-1">ID: {id}</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                        <span>←</span>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>
        );
    }

    const urgencyColors = {
        high: "text-red-600 bg-red-50 border-red-200",
        medium: "text-amber-600 bg-amber-50 border-amber-200",
        low: "text-emerald-600 bg-emerald-50 border-emerald-200"
    };

    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                    <span>←</span>
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Ticket Details
                        </h2>
                        <p className="text-gray-600">
                            ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{id}</span>
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border font-semibold ${urgencyColors[ticket.urgency as keyof typeof urgencyColors] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {ticket.urgency?.toUpperCase() || 'PENDING'} PRIORITY
                    </div>
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-linear-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Ticket Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Customer Email</p>
                        <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                📧
                            </span>
                            {ticket.email}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
                        <p className="text-base font-semibold capitalize">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                {ticket.status}
                            </span>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</p>
                        <p className="text-base font-semibold text-gray-900">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                                🏷️ {ticket.category || 'Uncategorized'}
                            </span>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</p>
                        <p className="text-base font-semibold text-gray-900">
                            {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer Message */}
            {ticket.message && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">💬</span>
                        Customer Message
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {ticket.message}
                        </p>
                    </div>
                </div>
            )}

            {/* AI Draft Reply */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        AI Draft Reply
                    </h3>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                        AI Generated
                    </span>
                </div>
                <textarea
                    className="w-full h-48 border-2 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono bg-gray-50"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="AI-generated response will appear here..."
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span>💡</span>
                    <span>Edit the draft above before sending to the customer</span>
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleSaveDraft}
                    disabled={isSaving || updateDraft.isPending}
                    className="flex-1 px-6 py-3 text-sm font-semibold border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSaving || updateDraft.isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <span>💾</span>
                            <span>Save Draft</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleResolve}
                    disabled={resolve.isPending}
                    className="flex-1 px-6 py-3 text-sm font-semibold bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {resolve.isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Resolving...</span>
                        </>
                    ) : (
                        <>
                            <span>✓</span>
                            <span>Resolve Ticket</span>
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}