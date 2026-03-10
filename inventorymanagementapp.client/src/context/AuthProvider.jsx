import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        try {
            const res = await api.get("/auth/me", { withCredentials: true });
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        setUser(res.data);
        return res.data;
    };

    const logout = async () => {
        await api.post("/auth/logout", {}, { withCredentials: true });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, fetchMe, loading }}>
            {children}
        </AuthContext.Provider>
    );
}