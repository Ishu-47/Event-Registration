import { useEffect, useState } from "react";
import { createEvent, deleteEvent, getEvents } from "../services/eventServices";


export default function Events() {

    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        location: "",
        startDateTime: "",
        endDateTime: "",
    });

    async function loadEvents() {

        try {
            const data = await getEvents();
            setEvents(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadEvents();
    }, []);

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
            await createEvent(form);

            setForm({
                name: "",
                description: "",
                location: "",
                startDateTime: "",
                endDateTime: "",
            });

            setShowForm(false);

            await loadEvents();

        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(id) {

        if (!window.confirm("Delete this event?")) {
            return;
        }

        try {
            await deleteEvent(id);
            await loadEvents();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">

            <div className="max-w-6xl mx-auto">

                <div className="flex items-center justify-between mb-8">

                    <div>
                        <h1 className="text-3xl font-bold">
                            Events
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage your conferences and workshops.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-white text-black px-5 py-3 rounded-lg font-semibold hover:bg-gray-200"
                    >
                        {showForm ? "Cancel" : "+ Create event"}
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
                            Create event
                        </h2>

                        <input
                            name="name"
                            placeholder="Event name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                            rows="3"
                        />

                        <input
                            name="location"
                            placeholder="Location"
                            value={form.location}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                        />

                        <div className="grid md:grid-cols-2 gap-4">

                            <div>
                                <label className="text-sm text-gray-400">
                                    Starts
                                </label>

                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={form.startDateTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full mt-2 bg-black border border-neutral-700 rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400">
                                    Ends
                                </label>

                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={form.endDateTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full mt-2 bg-black border border-neutral-700 rounded-lg px-4 py-3"
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="bg-white text-black px-5 py-3 rounded-lg font-semibold"
                        >
                            Create event
                        </button>

                    </form>
                )}

                {events.length === 0 ? (
                    <div className="border border-neutral-800 rounded-2xl p-12 text-center text-gray-500">
                        No events yet.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {events.map((event) => (

                            <div
                                key={event.id}
                                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-600 transition"
                            >

                                <h2 className="text-xl font-semibold">
                                    {event.name}
                                </h2>

                                <p className="text-gray-400 mt-3">
                                    {event.description || "No description"}
                                </p>

                                <div className="mt-5 space-y-2 text-sm text-gray-500">
                                    <p>📍 {event.location}</p>
                                    <p>
                                        {new Date(event.startDateTime).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="mt-5 text-sm text-gray-500 hover:text-red-400"
                                >
                                    Delete
                                </button>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}