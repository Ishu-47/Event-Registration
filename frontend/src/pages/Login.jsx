import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const user = await login(email, password);
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
                        Welcome back
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Sign in to manage your events.
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
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 outline-none focus:border-white"
                            placeholder="Your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-gray-200 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="text-white hover:underline"
                        >
                            Create one
                        </button>
                    </p>

                </form>

            </div>
        </div>
    );
}