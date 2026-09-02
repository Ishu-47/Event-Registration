import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

export default function MySessions() {

    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {

        fetch(`${API_URL}/sessions/my-sessions`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async response => {

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to load sessions"
                    );
                }

                return data;
            })
            .then(setSessions)
            .catch(err =>
                setError(err.message)
            );

    }, []);

    return (
        <div className="p-8">

            <div className="max-w-6xl mx-auto">

                <div className="mb-8">

                    <p className="text-sm text-gray-500">
                        Check-in staff
                    </p>

                    <h1 className="text-3xl font-bold mt-1">
                        My Sessions
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Sessions assigned to you.
                    </p>

                </div>

                {error && (
                    <div className="border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3 mb-5">
                        {error}
                    </div>
                )}

                {sessions.length === 0 ? (

                    <div className="border border-neutral-800 rounded-2xl p-12 text-center">

                        <h2 className="font-semibold">
                            No sessions assigned
                        </h2>

                        <p className="text-sm text-gray-600 mt-2">
                            An organizer will assign sessions to you.
                        </p>

                    </div>

                ) : (

                    <div className="grid md:grid-cols-2 gap-5">

                        {sessions.map(session => (

                            <div
                                key={session.id}
                                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6"
                            >

                                <h2 className="text-xl font-semibold">
                                    {session.title}
                                </h2>

                                <p className="text-sm text-gray-500 mt-3">
                                    {session.description}
                                </p>

                                <div className="mt-5 text-sm text-gray-500">
                                    <p>
                                        {new Date(
                                            session.startDateTime
                                        ).toLocaleString()}
                                    </p>

                                    <p className="mt-1">
                                        Capacity: {session.capacity}
                                    </p>
                                </div>

                                <Link
                                    to={`/sessions/${session.id}/registrations`}
                                    className="inline-block mt-5 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold"
                                >
                                    Manage registrations
                                </Link>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}