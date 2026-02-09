"use client";

import { useState } from "react";
import { useCreateTicket } from "@/lib/queries";
import Link from "next/link";

export default function SubmitTicketPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const { mutate, data, isPending, error } = useCreateTicket();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ email, message });
    };

    return (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                    <span className="text-3xl">🎫</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                    Submit Support Ticket
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                    Describe your issue and our AI will help categorize and prioritize your request
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6"
            >
                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400">📧</span>
                        </div>
                        <input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700">
                        Describe Your Issue
                    </label>
                    <textarea
                        id="message"
                        placeholder="Please provide as much detail as possible about your issue..."
                        className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>💡</span>
                        <span>Include relevant details like error messages, steps to reproduce, etc.</span>
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <>
                            <span>Send Ticket</span>
                            <span>→</span>
                        </>
                    )}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-700">Failed to submit ticket</p>
                            <p className="text-sm text-red-600 mt-1">Please try again or contact support</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {data && (
                <div className="mt-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg animate-fadeIn">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-green-800 text-lg mb-1">
                                Ticket Submitted Successfully!
                            </p>
                            <p className="text-sm text-green-700 mb-3">
                                We've received your request and will get back to you soon.
                            </p>
                            <div className="bg-white/60 rounded-lg p-3 mb-4 border border-green-200">
                                <p className="text-xs text-green-600 font-medium mb-1">Ticket ID</p>
                                <p className="font-mono text-sm text-gray-700 break-all">{data.id}</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-300 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all text-sm shadow-sm"
                                >
                                    <span>←</span>
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    href={`/ticket/${data.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all text-sm shadow-md"
                                >
                                    <span>View Ticket</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}