import { useEffect, useState } from "react";
import api from "../api/api";
import { useTheme } from "../hooks/useTheme";

export default function AdminPage() {
    const [users, setUsers] = useState([]);

    const { theme } = useTheme();

    const loadUsers = async () => {
        const res = await api.get("/admin/users");
        setUsers(res.data);
    };

    useEffect(() => {
        const loadUsers = async () => {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        };
        loadUsers();
    }, []);

    const block = async (id) => {
        await api.post(`/admin/block/${id}`);
        loadUsers();
    };

    const unblock = async (id) => {
        await api.post(`/admin/unblock/${id}`);
        loadUsers();
    };

    const makeAdmin = async (id) => {
        await api.post(`/admin/make-admin/${id}`);
        loadUsers();
    };

    const removeAdmin = async (id) => {
        await api.post(`/admin/remove-admin/${id}`);
        loadUsers();
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        await api.delete(`/admin/delete/${id}`);
        loadUsers();
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Admin Panel</h3>
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className={theme === "light" ? "table table-light" : "table table-dark"}>
                        <tr>
                            <th>Email</th>
                            <th>Admin</th>
                            <th>Blocked</th>
                            <th style={{ width: "260px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.email}</td>
                                <td>
                                    {u.isAdmin
                                        ? <span className="badge bg-success">Admin</span>
                                        : <span className="badge bg-secondary">User</span>}
                                </td>
                                <td>
                                    {u.isBlocked
                                        ? <span className="badge bg-danger">Blocked</span>
                                        : <span className="badge bg-success">Active</span>}
                                </td>
                                <td className="d-flex gap-2 flex-wrap">
                                    {u.isBlocked
                                        ? (
                                            <button className="btn btn-success btn-sm" onClick={() => unblock(u.id)}>
                                                Unblock
                                            </button>
                                        )
                                        : (
                                            <button className="btn btn-warning btn-sm" onClick={() => block(u.id)}>
                                                Block
                                            </button>
                                        )
                                    }
                                    {u.isAdmin
                                        ? (
                                            <button className="btn btn-secondary btn-sm" onClick={() => removeAdmin(u.id)}>
                                                Remove Admin
                                            </button>
                                        )
                                        : (
                                            <button className="btn btn-primary btn-sm" onClick={() => makeAdmin(u.id)}>
                                                Make Admin
                                            </button>
                                        )
                                    }
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}