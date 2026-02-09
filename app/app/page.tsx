"use client";

import Link from "next/link";
import { useTickets } from "@/lib/queries";

const urgencyConfig = {
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    label: "High Priority"
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    label: "Medium"
  },
  low: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    label: "Low"
  },
  default: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
    label: "Pending"
  }
};

const statusConfig = {
  open: { bg: "bg-blue-100", text: "text-blue-700" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  resolved: { bg: "bg-green-100", text: "text-green-700" },
  closed: { bg: "bg-gray-100", text: "text-gray-700" }
};

export default function Dashboard() {
  const { data, isLoading, error } = useTickets();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 max-w-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-700 font-medium">Failed to load tickets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">🎫</span>
            Support Tickets
          </h2>
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-700">
              {data?.length || 0} Total Tickets
            </p>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Manage and track all customer support requests
        </p>
      </div>

      {/* Tickets List */}
      {!data || data.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tickets yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first support ticket
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <span>Create Ticket</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((t: any) => {
            const urgency = urgencyConfig[t.urgency as keyof typeof urgencyConfig] || urgencyConfig.default;
            const status = statusConfig[t.status as keyof typeof statusConfig] || statusConfig.open;

            return (
              <Link
                key={t.id}
                href={`/ticket/${t.id}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        {t.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {t.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {t.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {t.status}
                      </span>
                      {t.category && (
                        <span className="px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                          {t.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Urgency Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border ${urgency.bg} ${urgency.text} ${urgency.border} shadow-sm`}
                    >
                      <span className={`w-2 h-2 rounded-full ${urgency.dot} animate-pulse`}></span>
                      {urgency.label}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-blue-600 transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}