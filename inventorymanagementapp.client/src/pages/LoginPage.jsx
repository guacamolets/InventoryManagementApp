import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            window.location.href = "/api/auth/google";
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>
            <h1>Login</h1>

            {error && <div style={{ color: "red" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>
            </form>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <a
                    href="/api/auth/google"
                    style={{ textAlign: "center", padding: "8px", background: "#4285F4", color: "#fff", borderRadius: 4 }}
                >
                    Login with Google
                </a>

                <a
                    href="/api/auth/github"
                    style={{ textAlign: "center", padding: "8px", background: "#1877F2", color: "#fff", borderRadius: 4 }}
                >
                    Login with GitHub
                </a>
            </div>
        </div>
    );
}