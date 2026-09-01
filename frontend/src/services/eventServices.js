const API_URL = "http://localhost:8080/api";

async function request(url, options = {}) {

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export function getEvents() {
    return request("/events");
}

export function createEvent(event) {
    return request("/events", {
        method: "POST",
        body: JSON.stringify(event),
    });
}

export function deleteEvent(id) {
    return request(`/events/${id}`, {
        method: "DELETE",
    });
}