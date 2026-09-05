const API_URL = "https://event-registration-production-21dc.up.railway.app/api";

export async function login(email, password){
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({email, password}),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));

    return data;
}

export async function register(name, email, password, invitationToken){
    const response = await fetch(`${API_URL}/auth/register`, {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({name, email, password, invitationToken}),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Registration failed");
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));

    return data;
}
export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}