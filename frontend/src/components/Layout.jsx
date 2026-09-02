import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function Layout() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-black text-white flex">


            <aside className="w-64 border-r border-neutral-800 hidden md:flex flex-col">

                <div className="p-6 border-b border-neutral-800">
                    <h1 className="text-xl font-bold">
                        Event Registration
                    </h1>

                    <p className="text-xs text-gray-500 mt-1">
                        Management Platform
                    </p>
                </div>

                <nav className="p-4 space-y-1">

                    <Link
                        to="/dashboard"
                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-neutral-900 hover:text-white"
                    >
                        Dashboard
                    </Link>

                    {user?.role === "ORGANIZER" && (
                        <Link
                            to="/events"
                            className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-neutral-900 hover:text-white"
                        >
                            Events
                        </Link>
                    )}

                    {user?.role === "CHECK_IN_STAFF" && (
                        <Link
                            to="/my-sessions"
                            className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-neutral-900 hover:text-white"
                        >
                            My Sessions
                        </Link>
                    )}

                    <Link
                        to="/registrations"
                        className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-neutral-900 hover:text-white"
                    >
                        Registrations
                    </Link>



                </nav>

                <div className="mt-auto p-4 border-t border-neutral-800">

                    <div className="px-4 mb-4">
                        <p className="text-sm font-medium">
                            {user?.name}
                        </p>

                        <p className="text-xs text-gray-500">
                            {user?.role}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-neutral-900 hover:text-white"
                    >
                        Sign out
                    </button>

                </div>

            </aside>
            <main className="flex-1 min-w-0">
                <Outlet />
            </main>

        </div>
    );
}