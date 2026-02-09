"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    useTicket,
    useUpdateDraft,
    useResolveTicket,
    useDeleteTicket,
} from "@/lib/queries";
import Link from "next/link";

export default function TicketDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { id } = use(params);

    const { data: ticket, isLoading, error } = useTicket(id);
    const updateDraft = useUpdateDraft(id);
    const resolve = useResolveTicket(id);
    const deleteTicket = useDeleteTicket();

    const [draft, setDraft] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (ticket?.ai_draft) {
            setDraft(ticket.ai_draft);
        }
    }, [ticket]);

    // Track changes in draft
    useEffect(() => {
        if (ticket?.ai_draft && draft !== ticket.ai_draft) {
            setHasChanges(true);
        } else {
            setHasChanges(false);
        }
    }, [draft, ticket?.ai_draft]);

    const handleSaveDraft = async () => {
        if (!hasChanges) return;

        setIsSaving(true);
        try {
            await updateDraft.mutateAsync({ draft: draft });
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to save draft:', error);
            alert('Failed to save draft. Please try again.');
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleResolve = async () => {
        if (hasChanges) {
            const confirmSave = confirm(
                "You have unsaved changes. Do you want to save them before resolving?"
            );
            if (confirmSave) {
                await handleSaveDraft();
            }
        }

        const confirmResolve = confirm("Are you sure you want to resolve this ticket?");
        if (confirmResolve) {
            try {
                await resolve.mutateAsync();
                router.push('/');
            } catch (error) {
                console.error('Failed to resolve ticket:', error);
                alert('Failed to resolve ticket. Please try again.');
            }
        }
    };

    const handleDelete = async () => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this ticket? This action cannot be undone."
        );
        if (confirmDelete) {
            try {
                await deleteTicket.mutateAsync(id);
                router.push('/');
            } catch (error) {
                console.error('Failed to delete ticket:', error);
                alert('Failed to delete ticket. Please try again.');
            }
        }
    };

    // Copy draft to clipboard
    const handleCopyDraft = () => {
        navigator.clipboard.writeText(draft);
        alert('Draft copied to clipboard!');
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

    if (error || !ticket) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 max-w-md">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">❌</span>
                        <div>
                            <p className="text-red-700 font-medium">Ticket not found</p>
                            <p className="text-sm text-red-600 mt-1">ID: {id}</p>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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

    const isResolved = ticket.status === 'resolved';

    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                    <span>←</span>
                    <span>Back to Dashboard</span>
                </Link>

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    disabled={deleteTicket.isPending}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    <span>🗑️</span>
                    <span>Delete</span>
                </button>
            </div>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Ticket Details
                        </h2>
                        <p className="text-gray-600">
                            ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{id.slice(0, 8)}...</span>
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border font-semibold ${urgencyColors[ticket.urgency as keyof typeof urgencyColors] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {ticket.urgency?.toUpperCase() || 'PENDING'} PRIORITY
                    </div>
                </div>

                {/* Resolved Banner */}
                {isResolved && ticket.resolved_at && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="text-green-800 font-semibold">Ticket Resolved</p>
                            <p className="text-sm text-green-600">
                                Resolved on {new Date(ticket.resolved_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                )}
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
                                        ticket.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
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

                    {/* Sentiment Score */}
                    {ticket.sentiment_score && (
                        <div className="space-y-2 sm:col-span-2">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sentiment Score</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all ${ticket.sentiment_score <= 3 ? 'bg-red-500' :
                                                ticket.sentiment_score <= 6 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                            }`}
                                        style={{ width: `${ticket.sentiment_score * 10}%` }}
                                    ></div>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{ticket.sentiment_score}/10</span>
                            </div>
                        </div>
                    )}
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
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xl">🤖</span>
                        AI Draft Reply
                    </h3>
                    <div className="flex items-center gap-2">
                        {hasChanges && (
                            <span className="px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full">
                                Unsaved Changes
                            </span>
                        )}
                        <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                            AI Generated
                        </span>
                    </div>
                </div>
                <textarea
                    className="w-full h-48 border-2 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-mono bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="AI-generated response will appear here..."
                    disabled={isResolved}
                />
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>💡</span>
                        <span>Edit the draft above before sending to the customer</span>
                    </p>
                    <button
                        onClick={handleCopyDraft}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Copy to clipboard
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleSaveDraft}
                    disabled={!hasChanges || isSaving || updateDraft.isPending || isResolved}
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
                    disabled={resolve.isPending || isResolved}
                    className="flex-1 px-6 py-3 text-sm font-semibold bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {resolve.isPending ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Resolving...</span>
                        </>
                    ) : isResolved ? (
                        <>
                            <span>✓</span>
                            <span>Already Resolved</span>
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