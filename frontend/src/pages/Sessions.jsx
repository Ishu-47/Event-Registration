import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

export default function Sessions() {

    const { eventId } = useParams();

    const [sessions, setSessions] = useState([]);
    const [event, setEvent] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        startDateTime: "",
        endDateTime: "",
        capacity: 50,
    });

    const token = localStorage.getItem("token");

    async function load() {

        try {

            const [eventResponse, sessionsResponse] =
                await Promise.all([
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

            if (!eventResponse.ok || !sessionsResponse.ok) {
                throw new Error("Unable to load event");
            }

            setEvent(await eventResponse.json());
            setSessions(await sessionsResponse.json());

        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        load();
    }, [eventId]);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

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

    async function handleDelete(id) {

        if (!window.confirm("Delete this session?")) {
            return;
        }

        try {

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
                throw new Error("Could not delete session");
            }

            await load();

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="p-8">

            <div className="max-w-6xl mx-auto">

                <Link
                    to="/events"
                    className="text-sm text-gray-500 hover:text-white"
                >
                    ← Back to events
                </Link>

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

                {error && (
                    <div className="mb-5 border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3">
                        {error}
                    </div>
                )}

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

                {sessions.length === 0 ? (

                    <div className="border border-neutral-800 rounded-2xl p-12 text-center text-gray-500">
                        No sessions yet.
                    </div>

                ) : (

                    <div className="space-y-4">

                        {sessions.map(session => (

                            <div
                                key={session.id}
                                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex items-center justify-between"
                            >

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {session.title}
                                    </h2>

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

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}