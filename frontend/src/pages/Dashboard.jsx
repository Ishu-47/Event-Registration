import { useEffect, useState } from "react";
import OrganizerInvite from "../components/OrganizerInvite";
import { getEvents } from "../services/eventServices";

export default function Dashboard() {

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [events, setEvents] = useState([]);

    useEffect(() => {

        if (user?.role !== "ORGANIZER") {
            return;
        }

        getEvents()
            .then(setEvents)
            .catch(() => {});

    }, []);

    const now = new Date();

    const upcomingEvents = events.filter(
        event => new Date(event.startDateTime) > now
    );

    return (
        <div className="p-8">

            <div className="max-w-7xl mx-auto">

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

                {user?.role === "ORGANIZER" ? (

                    <>
                        {/* Statistics */}

                        <div className="grid md:grid-cols-3 gap-5 mb-8">

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                                <p className="text-gray-500 text-sm">
                                    Total events
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {events.length}
                                </p>
                            </div>

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                                <p className="text-gray-500 text-sm">
                                    Upcoming events
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {upcomingEvents.length}
                                </p>
                            </div>

                            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                                <p className="text-gray-500 text-sm">
                                    Your role
                                </p>

                                <p className="text-xl font-semibold mt-3">
                                    Organizer
                                </p>
                            </div>

                        </div>

                        {/* Invitation */}

                        <OrganizerInvite />

                        {/* Upcoming events */}

                        <div className="mt-8">

                            <div className="flex items-center justify-between mb-4">

                                <h2 className="text-xl font-semibold">
                                    Upcoming events
                                </h2>

                            </div>

                            {upcomingEvents.length === 0 ? (

                                <div className="border border-neutral-800 rounded-2xl p-8 text-center">
                                    <p className="text-gray-500">
                                        No upcoming events.
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        Create your first event to get started.
                                    </p>
                                </div>

                            ) : (

                                <div className="grid md:grid-cols-2 gap-4">

                                    {upcomingEvents
                                        .slice(0, 4)
                                        .map(event => (

                                            <div
                                                key={event.id}
                                                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5"
                                            >

                                                <h3 className="font-semibold">
                                                    {event.name}
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-2">
                                                    {event.location}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(
                                                        event.startDateTime
                                                    ).toLocaleString()}
                                                </p>

                                            </div>

                                        ))}

                                </div>

                            )}

                        </div>

                    </>

                ) : (

                    /* Staff dashboard */

                    <div className="grid md:grid-cols-2 gap-5">

                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                            <p className="text-gray-500 text-sm">
                                Account
                            </p>

                            <h2 className="text-xl font-semibold mt-2">
                                Check-in Staff
                            </h2>

                            <p className="text-gray-500 text-sm mt-3">
                                Your assigned sessions and check-in
                                functionality will appear here.
                            </p>

                        </div>

                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

                            <p className="text-gray-500 text-sm">
                                Next
                            </p>

                            <h2 className="text-xl font-semibold mt-2">
                                Sessions
                            </h2>

                            <p className="text-gray-500 text-sm mt-3">
                                Session assignments will be available
                                once an organizer assigns you.
                            </p>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}