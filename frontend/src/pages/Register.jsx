import { useState } from "react";
import { register } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Register({ onRegistered, onLogin }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const navigate = useNavigate();

    const invitationToken = new URLSearchParams(window.location.search).get("invite");

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.password, invitationToken);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Create your account
                    </h1>

                    <p className="text-gray-400 mt-2">
                        {invitationToken
                            ? "You've been invited as an organizer."
                            : "Create an account to get started."}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-5"
                >

                    {error && (
                        <div className="border border-red-800 bg-red-950/40 text-red-300 rounded-lg p-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Name
                        </label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-white"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-white"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-white"
                            placeholder="At least 8 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-gray-200 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-white hover:underline"
                        >
                            Sign in
                        </button>
                    </p>

                </form>

                <p className="text-center text-xs text-gray-600 mt-5">
                    {invitationToken
                        ? "Your organizer invitation will be verified during registration."
                        : "New accounts are created as check-in staff. Organizer access requires an invitation."}
                </p>

            </div>
        </div>
    );
}