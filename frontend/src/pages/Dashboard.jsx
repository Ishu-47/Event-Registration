import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrganizerInvite from "../components/OrganizerInvite";
import { getEvents } from "../services/eventServices";
import { getMySessions } from "../services/sessionServices";

export default function Dashboard() {

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [events, setEvents] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {

        if (user?.role === "ORGANIZER") {
            getEvents()
                .then(setEvents)
                .catch(() => { });
        }

        if (user?.role === "CHECK_IN_STAFF") {
            getMySessions()
                .then(setSessions)
                .catch(() => { });
        }

    }, []);

    const now = new Date();

    // =========================
    // ORGANIZER DATA
    // =========================

    const upcomingEvents = events.filter(
        event => new Date(event.startDateTime) > now
    );

    const pastEvents = events.filter(
        event => new Date(event.startDateTime) <= now
    );

    // =========================
    // STAFF DATA
    // =========================

    const upcomingSessions = sessions
        .filter(
            session =>
                new Date(session.startDateTime) > now
        )
        .sort(
            (a, b) =>
                new Date(a.startDateTime) -
                new Date(b.startDateTime)
        );

    const nextSession = upcomingSessions[0];

    return (
        <div className="p-8">

            <div className="max-w-7xl mx-auto">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="mb-8">

                    <p className="text-sm text-gray-500">
                        Welcome back
                    </p>

                    <h1 className="text-3xl font-bold mt-1">
                        {user?.name}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        {user?.role === "ORGANIZER"
                            ? "Manage your events and team."
                            : "Stay on top of your assigned sessions."}
                    </p>

                </div>

                {/* ==================================================
                    ORGANIZER DASHBOARD
                ================================================== */}

                {user?.role === "ORGANIZER" ? (

                    <>
                        {/* Statistics */}

                        <div className="grid md:grid-cols-3 gap-5 mb-8">

                            {/* Total events */}

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                                <p className="text-gray-500 text-sm">
                                    Total events
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {events.length}
                                </p>

                            </div>

                            {/* Upcoming events */}

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                                <p className="text-gray-500 text-sm">
                                    Upcoming events
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {upcomingEvents.length}
                                </p>

                            </div>

                            {/* Past events */}

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                                <p className="text-gray-500 text-sm">
                                    Past events
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {pastEvents.length}
                                </p>

                            </div>

                        </div>

                        {/* =========================
                            UPCOMING EVENTS
                        ========================= */}

                        <div className="mt-8">

                            <div className="flex items-center justify-between mb-4">

                                <h2 className="text-xl font-semibold">
                                    Upcoming events
                                </h2>

                                <Link
                                    to="/events"
                                    className="text-sm text-gray-400 hover:text-white"
                                >
                                    View all →
                                </Link>

                            </div>

                            {upcomingEvents.length === 0 ? (

                                <div className="border border-neutral-800 rounded-2xl p-8 text-center">

                                    <p className="text-gray-500">
                                        No upcoming events.
                                    </p>

                                    <Link
                                        to="/events"
                                        className="inline-block mt-3 text-sm text-white hover:underline"
                                    >
                                        Create an event →
                                    </Link>

                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {upcomingEvents
                                        .sort(
                                            (a, b) =>
                                                new Date(a.startDateTime) -
                                                new Date(b.startDateTime)
                                        )
                                        .map(event => (

                                            <div
                                                key={event.id}
                                                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between"
                                            >

                                                <div>

                                                    <h3 className="font-semibold">
                                                        {event.name}
                                                    </h3>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {new Date(
                                                            event.startDateTime
                                                        ).toLocaleString()}
                                                    </p>

                                                    {event.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {event.description}
                                                        </p>
                                                    )}

                                                </div>

                                                <Link
                                                    to={`/events/${event.id}/sessions`}
                                                    className="text-sm font-medium hover:underline"
                                                >
                                                    Manage →
                                                </Link>

                                            </div>

                                        ))}

                                </div>

                            )}

                        </div>

                        {/* =========================
                            ORGANIZER INVITE
                        ========================= */}

                        <div className="mt-8">

                            <OrganizerInvite />

                        </div>

                    </>

                ) : (

                    /* ==================================================
                       STAFF DASHBOARD
                    ================================================== */

                    <>

                        {/* Statistics */}

                        <div className="grid md:grid-cols-3 gap-5 mb-8">

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                                <p className="text-gray-500 text-sm">
                                    Assigned sessions
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {sessions.length}
                                </p>

                            </div>

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                                <p className="text-gray-500 text-sm">
                                    Upcoming sessions
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {upcomingSessions.length}
                                </p>

                            </div>

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                                <p className="text-gray-500 text-sm">
                                    Next session
                                </p>

                                {nextSession ? (

                                    <>
                                        <p className="text-lg font-semibold mt-2 truncate">
                                            {nextSession.title}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(
                                                nextSession.startDateTime
                                            ).toLocaleString()}
                                        </p>
                                    </>

                                ) : (

                                    <p className="text-lg font-semibold mt-2">
                                        None
                                    </p>

                                )}

                            </div>

                        </div>

                        {/* Upcoming Sessions */}

                        <div className="mt-8">

                            <h2 className="text-xl font-semibold mb-4">
                                Your upcoming sessions
                            </h2>

                            {upcomingSessions.length === 0 ? (

                                <div className="border border-neutral-800 rounded-2xl p-8 text-center">

                                    <p className="text-gray-500">
                                        No upcoming sessions.
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        An organizer will assign sessions
                                        to you.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {upcomingSessions.map(session => (

                                        <div
                                            key={session.id}
                                            className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between"
                                        >

                                            <div>

                                                <h3 className="font-semibold">
                                                    {session.title}
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(
                                                        session.startDateTime
                                                    ).toLocaleString()}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Capacity: {session.capacity}
                                                </p>

                                            </div>

                                            <Link
                                                to={`/sessions/${session.id}/registrations`}
                                                className="text-sm font-medium hover:underline"
                                            >
                                                Manage →
                                            </Link>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </>

                )}

            </div>

        </div>
    );
}