import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";

function App() {

  const [page, setPage] = useState("login");

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  if (user) {
    return <Events />;
    // return (
    //   <div className="min-h-screen bg-black text-white flex items-center justify-center">
    //     <div className="text-center">
    //       <h1 className="text-3xl font-bold">
    //         Welcome, {user.name}
    //       </h1>

    //       <p className="text-gray-400 mt-2">
    //         Role: {user.role}
    //       </p>
    //     </div>
    //   </div>
    // );
  }

  if (page === "register") {
    return (
      <Register
        onRegistered={setUser}
        onLogin={() => setPage("login")}
      />
    );
  }

  return (
    <Login
      onLoggedIn={setUser}
      onRegister={() => setPage("register")}
    />
  );
}

export default App;