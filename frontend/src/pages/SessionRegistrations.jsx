import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

export default function SessionRegistrations() {
    const { sessionId } = useParams();

    const [registrations, setRegistrations] = useState([]);
    const [session, setSession] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
    });

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [sortBy, setSortBy] = useState("name");
    const [direction, setDirection] = useState("asc");

    // Pagination
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Capacity
    const [activeRegistrations, setActiveRegistrations] = useState(0);

    // CSV
    const [csvFile, setCsvFile] = useState(null);
    const [csvLoading, setCsvLoading] = useState(false);

    // History
    const [history, setHistory] = useState([]);
    const [historyRegistration, setHistoryRegistration] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    const token = localStorage.getItem("token");

    const availableSeats = Math.max(
        0,
        (session?.capacity || 0) - activeRegistrations
    );

    const isFull = availableSeats === 0;

    async function load() {
        try {
            setLoading(true);
            setError("");

            const sessionResponse = await fetch(
                `${API_URL}/sessions/${sessionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!sessionResponse.ok) {
                const data = await sessionResponse.json().catch(() => ({}));

                throw new Error(
                    data.message || "Unable to load session"
                );
            }

            const sessionData = await sessionResponse.json();

            setSession(sessionData);

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (status) {
                params.append("status", status);
            }

            params.append("sortBy", sortBy);
            params.append("direction", direction);
            params.append("page", page);
            params.append("size", size);

            const registrationsResponse = await fetch(
                `${API_URL}/registrations/sessions/${sessionId}?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const registrationData =
                await registrationsResponse.json();

            if (!registrationsResponse.ok) {
                throw new Error(
                    registrationData.message ||
                    "Unable to load registrations"
                );
            }

            setRegistrations(
                registrationData.content || []
            );

            setTotalElements(
                registrationData.totalElements || 0
            );

            setTotalPages(
                registrationData.totalPages || 0
            );

            setActiveRegistrations(
                registrationData.activeRegistrations || 0
            );

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [
        sessionId,
        search,
        status,
        sortBy,
        direction,
        page,
    ]);

    async function handleRegister(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/registrations/sessions/${sessionId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Registration failed"
                );
            }

            setSuccess(
                `Registration created. Confirmation code: ${data.confirmationCode}`
            );

            setForm({
                name: "",
                email: "",
            });

            setShowForm(false);

            setPage(0);

            await load();

        } catch (err) {
            setError(err.message);
        }
    }

    async function action(url, successMessage) {
        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}${url}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Action failed"
                );
            }

            if (successMessage) {
                setSuccess(successMessage);
            }

            await load();

        } catch (err) {
            setError(err.message);
        }
    }

    // =========================
    // HISTORY
    // =========================

    async function handleViewHistory(registration) {
        setHistoryLoading(true);
        setError("");
        setHistoryRegistration(registration);
        setHistory([]);

        try {
            const response = await fetch(
                `${API_URL}/registrations/${registration.id}/history`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load registration history"
                );
            }

            setHistory(data || []);

        } catch (err) {
            setError(err.message);
            setHistoryRegistration(null);
        } finally {
            setHistoryLoading(false);
        }
    }

    function closeHistory() {
        setHistoryRegistration(null);
        setHistory([]);
    }

    // =========================
    // CSV IMPORT
    // =========================

    function handleCsvFileChange(e) {
        const file = e.target.files?.[0];

        setCsvFile(file || null);
        setError("");
        setSuccess("");
    }

    async function handleCsvImport() {
        if (!csvFile) {
            setError("Please select a CSV file.");
            return;
        }

        setError("");
        setSuccess("");
        setCsvLoading(true);

        try {
            const formData = new FormData();

            formData.append("file", csvFile);

            const response = await fetch(
                `${API_URL}/registrations/sessions/${sessionId}/import`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "CSV import failed"
                );
            }

            let message =
                `CSV import complete: ${data.imported} imported, ${data.failed} failed.`;

            if (data.errors && data.errors.length > 0) {
                message += ` ${data.errors.join(" | ")}`;
            }

            if (data.failed > 0) {
                setError(message);
            } else {
                setSuccess(message);
            }

            setCsvFile(null);

            const fileInput =
                document.getElementById("csv-file");

            if (fileInput) {
                fileInput.value = "";
            }

            setPage(0);

            await load();

        } catch (err) {
            setError(err.message);
        } finally {
            setCsvLoading(false);
        }
    }

    // =========================
    // CSV EXPORT
    // =========================

    async function handleCsvExport() {
        setError("");
        setSuccess("");
        setCsvLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/registrations/sessions/${sessionId}/export`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data =
                    await response.json().catch(() => ({}));

                throw new Error(
                    data.message ||
                    "CSV export failed"
                );
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download =
                `session-${sessionId}-registrations.csv`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            setSuccess("CSV exported successfully.");

        } catch (err) {
            setError(err.message);
        } finally {
            setCsvLoading(false);
        }
    }

    function getStatusClass(status) {
        switch (status) {
            case "CONFIRMED":
                return "border-green-800 text-green-400 bg-green-950/30";

            case "CHECKED_IN":
                return "border-blue-800 text-blue-400 bg-blue-950/30";

            case "RESERVED":
                return "border-yellow-800 text-yellow-400 bg-yellow-950/30";

            case "CANCELLED":
                return "border-red-800 text-red-400 bg-red-950/30";

            case "EXPIRED":
                return "border-neutral-700 text-gray-500 bg-neutral-900";

            default:
                return "border-neutral-700 text-gray-400";
        }
    }

    function handleSearchChange(e) {
        setSearch(e.target.value);
        setPage(0);
    }

    function handleStatusChange(e) {
        setStatus(e.target.value);
        setPage(0);
    }

    function handleSortChange(e) {
        setSortBy(e.target.value);
        setPage(0);
    }

    function handleDirectionChange() {
        setDirection(current =>
            current === "asc"
                ? "desc"
                : "asc"
        );

        setPage(0);
    }

    return (
        <div className="p-8">

            <div className="max-w-7xl mx-auto">

                {/* Back */}

                <Link
                    to={`/events/${session?.eventId}/sessions`}
                    className="text-sm text-gray-500 hover:text-white"
                >
                    ← Back to sessions
                </Link>

                {/* Header */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 mb-8">

                    <div>

                        <h1 className="text-3xl font-bold">
                            {session?.title || "Registrations"}
                        </h1>

                        <p className="text-gray-500 mt-2">
                            {session?.description ||
                                "Manage attendees for this session."}
                        </p>

                        {session?.startDateTime && (

                            <p className="text-sm text-gray-500 mt-2">

                                {new Date(
                                    session.startDateTime
                                ).toLocaleString()}

                            </p>

                        )}

                    </div>

                    <button
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setShowForm(!showForm);
                        }}
                        disabled={isFull}
                        className="bg-white text-black px-5 py-3 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isFull
                            ? "Session full"
                            : showForm
                                ? "Cancel"
                                : "+ Register attendee"}
                    </button>

                </div>

                {/* Error */}

                {error && (

                    <div className="mb-5 border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3">
                        {error}
                    </div>

                )}

                {/* Success */}

                {success && (

                    <div className="mb-5 border border-neutral-700 bg-neutral-900 text-gray-200 rounded-lg p-3">
                        {success}
                    </div>

                )}

                {/* Capacity statistics */}

                <div className="grid md:grid-cols-3 gap-4 mb-8">

                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                        <p className="text-gray-500 text-sm">
                            Capacity
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {session?.capacity ?? "-"}
                        </p>

                    </div>

                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                        <p className="text-gray-500 text-sm">
                            Registered
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {activeRegistrations}
                        </p>

                    </div>

                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                        <p className="text-gray-500 text-sm">
                            Available
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {availableSeats}
                        </p>

                    </div>

                </div>

                {/* CSV Import / Export */}

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 mb-8">

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

                        <div>

                            <h2 className="text-xl font-semibold">
                                CSV Import / Export
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Import attendees using a CSV with
                                <span className="text-gray-300">
                                    {" "}name,email
                                </span>
                                {" "}columns.
                            </p>

                            <div className="mt-4 flex flex-col sm:flex-row gap-3">

                                <input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleCsvFileChange}
                                    className="block text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-gray-200"
                                />

                                <button
                                    type="button"
                                    onClick={handleCsvImport}
                                    disabled={!csvFile || csvLoading}
                                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {csvLoading
                                        ? "Processing..."
                                        : "Import CSV"}
                                </button>

                            </div>

                            {csvFile && (

                                <p className="text-xs text-gray-500 mt-2">
                                    Selected: {csvFile.name}
                                </p>

                            )}

                        </div>

                        <button
                            type="button"
                            onClick={handleCsvExport}
                            disabled={csvLoading}
                            className="border border-neutral-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Export CSV
                        </button>

                    </div>

                </div>

                {/* Registration form */}

                {showForm && (

                    <form
                        onSubmit={handleRegister}
                        className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 mb-8 max-w-xl space-y-5"
                    >

                        <h2 className="text-xl font-semibold">
                            Register attendee
                        </h2>

                        <div>

                            <label className="block text-sm text-gray-400 mb-2">
                                Name
                            </label>

                            <input
                                name="name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Attendee name"
                                required
                                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-neutral-400"
                            />

                        </div>

                        <div>

                            <label className="block text-sm text-gray-400 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Attendee email"
                                required
                                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-neutral-400"
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={isFull}
                            className="bg-white text-black px-5 py-3 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isFull
                                ? "Session full"
                                : "Register"}
                        </button>

                    </form>

                )}

                {/* Search / Filters */}

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 mb-5">

                    <div className="grid md:grid-cols-4 gap-4">

                        <div className="md:col-span-2">

                            <label className="block text-sm text-gray-400 mb-2">
                                Search
                            </label>

                            <input
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search name or email..."
                                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-neutral-400"
                            />

                        </div>

                        <div>

                            <label className="block text-sm text-gray-400 mb-2">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={handleStatusChange}
                                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none"
                            >

                                <option value="">
                                    All statuses
                                </option>

                                <option value="RESERVED">
                                    Reserved
                                </option>

                                <option value="CONFIRMED">
                                    Confirmed
                                </option>

                                <option value="CHECKED_IN">
                                    Checked in
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                                <option value="EXPIRED">
                                    Expired
                                </option>

                            </select>

                        </div>

                        <div>

                            <label className="block text-sm text-gray-400 mb-2">
                                Sort by
                            </label>

                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none"
                            >

                                <option value="name">
                                    Name
                                </option>

                                <option value="email">
                                    Email
                                </option>

                                <option value="status">
                                    Status
                                </option>

                            </select>

                        </div>

                    </div>

                    <div className="mt-4">

                        <button
                            onClick={handleDirectionChange}
                            className="text-sm text-gray-400 hover:text-white border border-neutral-700 rounded-lg px-4 py-2"
                        >
                            Sort:{" "}
                            {direction === "asc"
                                ? "Ascending ↑"
                                : "Descending ↓"}
                        </button>

                    </div>

                </div>

                {/* Attendees */}

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">

                    <div className="px-6 py-5 border-b border-neutral-800">

                        <h2 className="font-semibold">
                            Attendees
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {totalElements} registration(s)
                        </p>

                    </div>

                    {loading ? (

                        <div className="p-10 text-center text-gray-500">
                            Loading registrations...
                        </div>

                    ) : registrations.length === 0 ? (

                        <div className="p-10 text-center">

                            <p className="text-gray-500">
                                No registrations found.
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                                Try changing your search or filters.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-neutral-800">

                            {registrations.map(
                                registration => (

                                    <div
                                        key={registration.id}
                                        className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                    >

                                        <div>

                                            <p className="font-medium">
                                                {registration.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {registration.email}
                                            </p>

                                            {registration.confirmationCode && (

                                                <p className="text-xs text-gray-600 mt-2">
                                                    Code:{" "}
                                                    <span className="text-gray-400">
                                                        {registration.confirmationCode}
                                                    </span>
                                                </p>

                                            )}

                                            {registration.status === "RESERVED" &&
                                                registration.expiresAt && (

                                                    <p className="text-xs text-yellow-500 mt-2">
                                                        Reserved until{" "}
                                                        {new Date(
                                                            registration.expiresAt
                                                        ).toLocaleTimeString()}
                                                    </p>

                                                )}

                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">

                                            <span
                                                className={`text-xs border px-3 py-1 rounded-full ${getStatusClass(
                                                    registration.status
                                                )}`}
                                            >
                                                {registration.status}
                                            </span>

                                            {/* History */}

                                            <button
                                                onClick={() =>
                                                    handleViewHistory(
                                                        registration
                                                    )
                                                }
                                                className="text-sm text-gray-400 hover:text-white"
                                            >
                                                History
                                            </button>

                                            {/* Confirm */}

                                            {registration.status ===
                                                "RESERVED" && (

                                                    <button
                                                        onClick={() =>
                                                            action(
                                                                `/registrations/${registration.confirmationCode}/confirm`,
                                                                "Registration confirmed."
                                                            )
                                                        }
                                                        className="text-sm text-white hover:underline"
                                                    >
                                                        Confirm
                                                    </button>

                                                )}

                                            {/* Check in */}

                                            {registration.status ===
                                                "CONFIRMED" && (

                                                    <button
                                                        onClick={() =>
                                                            action(
                                                                `/registrations/${registration.id}/check-in`,
                                                                "Attendee checked in."
                                                            )
                                                        }
                                                        className="text-sm text-white hover:underline"
                                                    >
                                                        Check in
                                                    </button>

                                                )}

                                            {/* Cancel */}

                                            {registration.status !==
                                                "CANCELLED" &&
                                                registration.status !==
                                                "CHECKED_IN" &&
                                                registration.status !==
                                                "EXPIRED" && (

                                                    <button
                                                        onClick={() =>
                                                            action(
                                                                `/registrations/${registration.id}/cancel`,
                                                                "Registration cancelled."
                                                            )
                                                        }
                                                        className="text-sm text-gray-500 hover:text-red-400"
                                                    >
                                                        Cancel
                                                    </button>

                                                )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                    {/* Pagination */}

                    {totalPages > 1 && (

                        <div className="px-6 py-5 border-t border-neutral-800 flex items-center justify-between">

                            <p className="text-sm text-gray-500">
                                Page {page + 1} of {totalPages}
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    disabled={page === 0}
                                    onClick={() =>
                                        setPage(
                                            current =>
                                                current - 1
                                        )
                                    }
                                    className="px-4 py-2 text-sm border border-neutral-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-500"
                                >
                                    ← Previous
                                </button>

                                <button
                                    disabled={
                                        page >= totalPages - 1
                                    }
                                    onClick={() =>
                                        setPage(
                                            current =>
                                                current + 1
                                        )
                                    }
                                    className="px-4 py-2 text-sm border border-neutral-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-500"
                                >
                                    Next →
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </div>

            {/* =========================
                HISTORY MODAL
            ========================= */}

            {historyRegistration && (

                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">

                        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Registration History
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {historyRegistration.name}
                                    {" · "}
                                    {historyRegistration.email}
                                </p>

                            </div>

                            <button
                                onClick={closeHistory}
                                className="text-gray-500 hover:text-white text-xl"
                            >
                                ×
                            </button>

                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">

                            {historyLoading ? (

                                <div className="py-10 text-center text-gray-500">
                                    Loading history...
                                </div>

                            ) : history.length === 0 ? (

                                <div className="py-10 text-center text-gray-500">
                                    No history found.
                                </div>

                            ) : (

                                <div className="relative ml-2">

                                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-800" />

                                    <div className="space-y-8">

                                        {history.map(
                                            item => (

                                                <div
                                                    key={item.id}
                                                    className="relative pl-8"
                                                >

                                                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-neutral-950" />

                                                    <div>

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            {item.oldStatus && (

                                                                <>
                                                                    <span className="text-sm text-gray-500">
                                                                        {item.oldStatus}
                                                                    </span>

                                                                    <span className="text-gray-600">
                                                                        →
                                                                    </span>
                                                                </>

                                                            )}

                                                            <span className="text-sm font-semibold">
                                                                {item.newStatus}
                                                            </span>

                                                        </div>

                                                        {item.notes && (

                                                            <p className="text-sm text-gray-400 mt-1">
                                                                {item.notes}
                                                            </p>

                                                        )}

                                                        <p className="text-xs text-gray-600 mt-2">
                                                            {new Date(
                                                                item.createdAt
                                                            ).toLocaleString()}
                                                        </p>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}