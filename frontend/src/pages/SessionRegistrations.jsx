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

    const [form, setForm] = useState({
        name: "",
        email: "",
    });

    const token = localStorage.getItem("token");

    async function load() {

        try {

            const sessionResponse =
                await fetch(
                    `${API_URL}/sessions/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            const registrationsResponse =
                await fetch(
                    `${API_URL}/registrations/sessions/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            if (
                !sessionResponse.ok ||
                !registrationsResponse.ok
            ) {
                throw new Error(
                    "Unable to load registration data"
                );
            }

            setSession(
                await sessionResponse.json()
            );

            setRegistrations(
                await registrationsResponse.json()
            );

        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        load();
    }, [sessionId]);

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

            await load();

        } catch (err) {
            setError(err.message);
        }
    }

    async function action(url) {

        try {

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
                    data.message || "Action failed"
                );
            }

            await load();

        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="p-8">

            <div className="max-w-7xl mx-auto">

                <Link
                    to={`/events/${session?.eventId}/sessions`}
                    className="text-sm text-gray-500 hover:text-white"
                >
                    ← Back to sessions
                </Link>

                <div className="flex items-center justify-between mt-6 mb-8">

                    <div>
                        <h1 className="text-3xl font-bold">
                            {session?.title || "Registrations"}
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage attendees for this session.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                        className="bg-white text-black px-5 py-3 rounded-lg font-semibold"
                    >
                        {showForm
                            ? "Cancel"
                            : "+ Register attendee"}
                    </button>

                </div>

                {error && (
                    <div className="mb-5 border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 border border-neutral-700 bg-neutral-900 text-gray-200 rounded-lg p-3">
                        {success}
                    </div>
                )}

                {showForm && (
                    <form
                        onSubmit={handleRegister}
                        className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 mb-8 max-w-xl space-y-5"
                    >

                        <h2 className="text-xl font-semibold">
                            Register attendee
                        </h2>

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
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                        />

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
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3"
                        />

                        <button
                            type="submit"
                            className="bg-white text-black px-5 py-3 rounded-lg font-semibold"
                        >
                            Register
                        </button>

                    </form>
                )}

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">

                    <div className="px-6 py-5 border-b border-neutral-800">
                        <h2 className="font-semibold">
                            Attendees
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {registrations.length} registration(s)
                        </p>
                    </div>

                    {registrations.length === 0 ? (

                        <div className="p-10 text-center text-gray-500">
                            No registrations yet.
                        </div>

                    ) : (

                        <div className="divide-y divide-neutral-800">

                            {registrations.map(
                                registration => (

                                    <div
                                        key={registration.id}
                                        className="px-6 py-5 flex items-center justify-between"
                                    >

                                        <div>
                                            <p className="font-medium">
                                                {registration.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {registration.email}
                                            </p>

                                            <p className="text-xs text-gray-600 mt-2">
                                                Code:{" "}
                                                {registration.confirmationCode}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">

                                            <span className="text-xs border border-neutral-700 px-3 py-1 rounded-full">
                                                {registration.status}
                                            </span>

                                            {registration.status ===
                                                "RESERVED" && (

                                                    <button
                                                        onClick={() =>
                                                            action(
                                                                `/registrations/${registration.confirmationCode}/confirm`
                                                            )
                                                        }
                                                        className="text-sm text-white hover:underline"
                                                    >
                                                        Confirm
                                                    </button>
                                                )}

                                            {registration.status ===
                                                "CONFIRMED" && (

                                                    <button
                                                        onClick={() =>
                                                            action(
                                                                `/registrations/${registration.id}/check-in`
                                                            )
                                                        }
                                                        className="text-sm text-white hover:underline"
                                                    >
                                                        Check in
                                                    </button>
                                                )}

                                            {registration.status !==
                                                "CANCELLED" &&
                                                registration.status !==
                                                "CHECKED_IN" &&
                                                registration.status !==
                                                "EXPIRED" && (

                                                    <button
                                                        onClick={() =>
                                                            action(
                                                                `/registrations/${registration.id}/cancel`
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

                </div>

            </div>

        </div>
    );
}