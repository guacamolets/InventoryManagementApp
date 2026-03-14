import { useEffect, useState } from "react";
import api from "../api/api";
import { useTheme } from "../context/theme/useTheme";
import { useTranslation } from "react-i18next";

export default function AdminPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const { theme } = useTheme();

    const loadUsers = async () => {
        const res = await api.get("/admin/users");
        setUsers(res.data);
    };

    useEffect(() => {
        const fetchData = async () => {
            loadUsers();
        };
        fetchData();
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
        if (!window.confirm(t("admin.confirmDelete"))) return;
        await api.delete(`/admin/delete/${id}`);
        loadUsers();
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">{t("admin.title")}</h3>
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className={theme === "light" ? "table table-light" : "table table-dark"}>
                        <tr>
                            <th>{t("admin.email")}</th>
                            <th>{t("admin.role")}</th>
                            <th>{t("admin.status")}</th>
                            <th style={{ width: "260px" }}>{t("admin.actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.email}</td>
                                <td>
                                    {u.isAdmin
                                        ? <span className="badge bg-success">{t("admin.adminRole")}</span>
                                        : <span className="badge bg-secondary">{t("admin.userRole")}</span>}
                                </td>
                                <td>
                                    {u.isBlocked
                                        ? <span className="badge bg-danger">{t("admin.blockedStatus")}</span>
                                        : <span className="badge bg-success">{t("admin.activeStatus")}</span>}
                                </td>
                                <td className="d-flex gap-2 flex-wrap">
                                    {u.isBlocked
                                        ? (
                                            <button className="btn btn-success btn-sm" onClick={() => unblock(u.id)}>
                                                {t("admin.unblockBtn")}
                                            </button>
                                        )
                                        : (
                                            <button className="btn btn-warning btn-sm" onClick={() => block(u.id)}>
                                                {t("admin.blockBtn")}
                                            </button>
                                        )
                                    }
                                    {u.isAdmin
                                        ? (
                                            <button className="btn btn-secondary btn-sm" onClick={() => removeAdmin(u.id)}>
                                                {t("admin.removeAdminBtn")}
                                            </button>
                                        )
                                        : (
                                            <button className="btn btn-primary btn-sm" onClick={() => makeAdmin(u.id)}>
                                                {t("admin.makeAdminBtn")}
                                            </button>
                                        )
                                    }
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                                        {t("admin.deleteBtn")}
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