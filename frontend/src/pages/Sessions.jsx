import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

export default function Sessions() {
    const { eventId } = useParams();

    const [sessions, setSessions] = useState([]);
    const [event, setEvent] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const [staff, setStaff] = useState([]);
    const [assignedStaff, setAssignedStaff] = useState({});
    const [showStaff, setShowStaff] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        capacity: 50,
    });

    const token = localStorage.getItem("token");

    // ---------------------------------------
    // Load event + sessions
    // ---------------------------------------
    async function load() {
        try {
            setError("");

            const [eventResponse, sessionsResponse] = await Promise.all([
                fetch(`${API_URL}/events/${eventId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                fetch(`${API_URL}/events/${eventId}/sessions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            if (!eventResponse.ok) {
                throw new Error("Unable to load event");
            }

            if (!sessionsResponse.ok) {
                throw new Error("Unable to load sessions");
            }

            const eventData = await eventResponse.json();
            const sessionData = await sessionsResponse.json();

            setEvent(eventData);
            setSessions(sessionData);

            // Load assigned staff for each session
            await loadAssignments(sessionData);
        } catch (err) {
            setError(err.message);
        }
    }

    // ---------------------------------------
    // Load all check-in staff
    // ---------------------------------------
    async function loadStaff() {
        try {
            const response = await fetch(`${API_URL}/sessions/staff`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Unable to load staff");
            }

            const data = await response.json();
            setStaff(data);
        } catch (err) {
            setError(err.message);
        }
    }

    // ---------------------------------------
    // Load assigned staff for sessions
    // ---------------------------------------
    async function loadAssignments(sessionList) {
        try {
            const assignmentResults = await Promise.all(
                sessionList.map(async (session) => {
                    const response = await fetch(
                        `${API_URL}/sessions/${session.id}/staff`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Unable to load staff for session ${session.id}`
                        );
                    }

                    const data = await response.json();

                    return [session.id, data];
                })
            );

            setAssignedStaff(
                Object.fromEntries(assignmentResults)
            );
        } catch (err) {
            setError(err.message);
        }
    }

    // ---------------------------------------
    // Initial load
    // ---------------------------------------
    useEffect(() => {
        load();
        loadStaff();
    }, [eventId]);

    // ---------------------------------------
    // Assign staff
    // ---------------------------------------
    async function assignStaff(staffId, sessionId) {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/sessions/${sessionId}/staff`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        staffId: staffId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not assign staff"
                );
            }

            // Reload assignments so UI immediately updates
            await loadAssignments(sessions);

            setShowStaff(null);
        } catch (err) {
            setError(err.message);
        }
    }

    // ---------------------------------------
    // Remove staff
    // ---------------------------------------
    async function removeStaff(staffId, sessionId) {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/sessions/${sessionId}/staff/${staffId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.message || "Could not remove staff"
                );
            }

            // Reload assignments
            await loadAssignments(sessions);
        } catch (err) {
            setError(err.message);
        }
    }

    // ---------------------------------------
    // Form change
    // ---------------------------------------
    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    // ---------------------------------------
    // Create session
    // ---------------------------------------
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/events/${eventId}/sessions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...form,
                        capacity: Number(form.capacity),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not create session"
                );
            }

            setForm({
                title: "",
                description: "",
                startDateTime: "",
                endDateTime: "",
                capacity: 50,
            });

            setShowForm(false);

            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    // ---------------------------------------
    // Delete session
    // ---------------------------------------
    async function handleDelete(id) {
        if (!window.confirm("Delete this session?")) {
            return;
        }

        try {
            setError("");

            const response = await fetch(
                `${API_URL}/sessions/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.message || "Could not delete session"
                );
            }

            await load();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">

                {/* Back */}
                <Link
                    to="/events"
                    className="text-sm text-gray-500 hover:text-white"
                >
                    ← Back to events
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mt-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {event?.name || "Sessions"}
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage sessions for this event.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-white text-black px-5 py-3 rounded-lg font-semibold"
                    >
                        {showForm ? "Cancel" : "+ Add session"}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3">
                        {error}
                    </div>
                )}

                {/* Create session form */}
                {showForm && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 mb-8 space-y-5"
                    >
                        <h2 className="text-xl font-semibold">
                            Add session
                        </h2>

                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Session title"
                            required
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                        />

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Description"
                            rows="3"
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                        />

                        <div className="grid md:grid-cols-3 gap-4">
                            <input
                                type="datetime-local"
                                name="startDateTime"
                                value={form.startDateTime}
                                onChange={handleChange}
                                required
                                className="bg-black border border-neutral-700 rounded-lg px-4 py-3"
                            />

                            <input
                                type="datetime-local"
                                name="endDateTime"
                                value={form.endDateTime}
                                onChange={handleChange}
                                required
                                className="bg-black border border-neutral-700 rounded-lg px-4 py-3"
                            />

                            <input
                                type="number"
                                name="capacity"
                                min="1"
                                value={form.capacity}
                                onChange={handleChange}
                                required
                                className="bg-black border border-neutral-700 rounded-lg px-4 py-3"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-white text-black px-5 py-3 rounded-lg font-semibold"
                        >
                            Create session
                        </button>
                    </form>
                )}

                {/* Sessions */}
                {sessions.length === 0 ? (
                    <div className="border border-neutral-800 rounded-2xl p-12 text-center text-gray-500">
                        No sessions yet.
                    </div>
                ) : (
                    <div className="space-y-4">

                        {sessions.map((session) => {
                            const sessionStaff =
                                assignedStaff[session.id] || [];

                            return (
                                <div
                                    key={session.id}
                                    className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6"
                                >
                                    {/* Session information */}
                                    <div className="flex items-start justify-between">

                                        <div>
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-lg font-semibold">
                                                    {session.title}
                                                </h2>

                                                <Link
                                                    to={`/sessions/${session.id}/registrations`}
                                                    className="text-sm text-white hover:underline"
                                                >
                                                    Registrations →
                                                </Link>
                                            </div>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {session.description}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-3">
                                                {new Date(
                                                    session.startDateTime
                                                ).toLocaleString()}

                                                {" — "}

                                                {new Date(
                                                    session.endDateTime
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Capacity
                                            </p>

                                            <p className="text-2xl font-semibold">
                                                {session.capacity}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    handleDelete(session.id)
                                                }
                                                className="text-sm text-gray-500 hover:text-red-400 mt-3"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Assigned staff */}
                                    <div className="mt-5 pt-5 border-t border-neutral-800">

                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium">
                                                Assigned staff
                                            </p>

                                            <button
                                                onClick={() =>
                                                    setShowStaff(
                                                        showStaff === session.id
                                                            ? null
                                                            : session.id
                                                    )
                                                }
                                                className="text-sm text-gray-400 hover:text-white"
                                            >
                                                + Assign
                                            </button>
                                        </div>

                                        {sessionStaff.length === 0 ? (
                                            <p className="text-xs text-gray-600">
                                                No staff assigned
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {sessionStaff.map((person) => (
                                                    <div
                                                        key={person.id}
                                                        className="flex items-center justify-between bg-black border border-neutral-800 rounded-lg px-3 py-2"
                                                    >
                                                        <div>
                                                            <p className="text-sm">
                                                                {person.name}
                                                            </p>

                                                            <p className="text-xs text-gray-600">
                                                                {person.email}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                removeStaff(
                                                                    person.id,
                                                                    session.id
                                                                )
                                                            }
                                                            className="text-xs text-gray-500 hover:text-red-400"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Staff selection */}
                                        {showStaff === session.id && (
                                            <div className="mt-3 space-y-2">

                                                {staff
                                                    .filter(
                                                        (person) =>
                                                            !sessionStaff.some(
                                                                (assigned) =>
                                                                    assigned.id ===
                                                                    person.id
                                                            )
                                                    )
                                                    .map((person) => (
                                                        <button
                                                            key={person.id}
                                                            onClick={() =>
                                                                assignStaff(
                                                                    person.id,
                                                                    session.id
                                                                )
                                                            }
                                                            className="w-full text-left bg-black border border-neutral-800 rounded-lg px-3 py-2 hover:border-neutral-600"
                                                        >
                                                            <p className="text-sm">
                                                                {person.name}
                                                            </p>

                                                            <p className="text-xs text-gray-600">
                                                                {person.email}
                                                            </p>
                                                        </button>
                                                    ))}

                                                {staff.length === 0 && (
                                                    <p className="text-xs text-gray-600">
                                                        No check-in staff accounts
                                                        exist.
                                                    </p>
                                                )}

                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}
            </div>
        </div>
    );
}