import { useState } from "react";

const API_URL = "https://event-registration-production-21dc.up.railway.app/api";

export default function OrganizerInvite() {

    const [email, setEmail] = useState("");
    const [link, setLink] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    async function createInvitation(e) {

        e.preventDefault();

        setError("");
        setLink("");
        setCopied(false);
        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/invitations/organizer?email=${encodeURIComponent(email)}`,
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
                    data.message || "Could not create invitation"
                );
            }

            setLink(data.registrationLink);
            setEmail("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function copyLink() {

        await navigator.clipboard.writeText(link);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">

            <div className="mb-5">
                <h2 className="text-xl font-semibold">
                    Invite an organizer
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Create a secure invitation link for another organizer.
                </p>
            </div>

            <form
                onSubmit={createInvitation}
                className="flex flex-col sm:flex-row gap-3"
            >

                <input
                    type="email"
                    placeholder="organizer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white outline-none focus:border-white"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black px-5 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create invite"}
                </button>

            </form>

            {error && (
                <div className="mt-4 border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3 text-sm">
                    {error}
                </div>
            )}

            {link && (
                <div className="mt-5">

                    <p className="text-sm text-gray-400 mb-2">
                        Invitation link
                    </p>

                    <div className="flex gap-2">

                        <input
                            value={link}
                            readOnly
                            className="flex-1 bg-black border border-neutral-700 rounded-lg px-4 py-3 text-gray-300 text-sm"
                        />

                        <button
                            type="button"
                            onClick={copyLink}
                            className="border border-neutral-700 px-4 py-3 rounded-lg hover:bg-neutral-900"
                        >
                            {copied ? "Copied" : "Copy"}
                        </button>

                    </div>

                    <p className="text-xs text-gray-600 mt-2">
                        This invitation expires after 24 hours.
                    </p>

                </div>
            )}

        </div>
    );
}