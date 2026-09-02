const API_URL = "http://localhost:8080/api";

export async function getMySessions() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/sessions/my-sessions`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to load assigned sessions"
        );
    }

    return data;
}
