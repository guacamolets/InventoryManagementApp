import { useEffect, useState } from "react";
import api from "../api/api";
import { useTheme } from "../context/theme/useTheme";
import { useTranslation } from "react-i18next";

export default function AdminPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
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

    const toggleOne = (id) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedUserIds.length === users.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(users.map(u => u.id));
        }
    };

    const clearSelection = () => setSelectedUserIds([]);

    const bulkAction = async (actionFn) => {
        await actionFn();
        loadUsers();
        clearSelection();
    };

    const bulkDelete = async () => {
        if (!window.confirm(t("admin.confirmDelete"))) return;
        await Promise.all(selectedUserIds.map(id => api.delete(`/admin/${id}`)));
        loadUsers();
        clearSelection();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <h3 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>
                    {t("admin.title")}
                </h3>

                {selectedUserIds.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 animate__animated animate__fadeIn">
                        <span className="align-self-center small fw-bold me-2 px-3 py-1 rounded-pill"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)' }}>
                            {t("admin.selected")}: {selectedUserIds.length}
                        </span>

                        <button className="btn btn-success btn-sm px-3 rounded-pill fw-bold"
                            onClick={() => bulkAction(() => Promise.all(selectedUserIds.map(id => api.post(`/admin/unblock/${id}`))))}>
                            {t("admin.unblockBtn")}
                        </button>

                        <button className="btn btn-warning btn-sm px-3 rounded-pill fw-bold text-dark"
                            onClick={() => bulkAction(() => Promise.all(selectedUserIds.map(id => api.post(`/admin/block/${id}`))))}>
                            {t("admin.blockBtn")}
                        </button>

                        <button className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-bold"
                            onClick={() => bulkAction(() => Promise.all(selectedUserIds.map(id => api.post(`/admin/make-admin/${id}`))))}>
                            {t("admin.makeAdminBtn")}
                        </button>

                        <button className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-bold"
                            onClick={() => bulkAction(() => Promise.all(selectedUserIds.map(id => api.post(`/admin/remove-admin/${id}`))))}>
                            {t("admin.removeAdminBtn")}
                        </button>

                        <button className="btn btn-outline-danger btn-sm px-3 rounded-pill fw-bold" onClick={bulkDelete}>
                            {t("admin.deleteBtn")}
                        </button>

                        <button className="btn btn-link text-decoration-none btn-sm text-muted" onClick={clearSelection}>
                            {t("admin.clearSelection")}
                        </button>
                    </div>
                )}
            </div>

            <div className="table-responsive shadow-sm rounded border" style={{ borderColor: 'var(--bs-border-color)' }}>
                <table className={`table table-hover align-middle mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
                    <thead className={theme === 'dark' ? 'table-dark' : 'table-light'}>
                        <tr>
                            <th style={{ width: '40px' }} className="px-3">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    onChange={toggleAll}
                                    checked={users.length > 0 && selectedUserIds.length === users.length}
                                />
                            </th>
                            <th className="small text-uppercase fw-bold opacity-75">{t("admin.email")}</th>
                            <th className="small text-uppercase fw-bold opacity-75 text-center">{t("admin.role")}</th>
                            <th className="small text-uppercase fw-bold opacity-75 text-center">{t("admin.status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr
                                key={u.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleOne(u.id)}
                                className={selectedUserIds.includes(u.id) ? 'table-active' : ''}
                            >
                                <td className="px-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedUserIds.includes(u.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => toggleOne(u.id)}
                                    />
                                </td>
                                <td className="fw-medium">{u.email}</td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill px-3 ${u.isAdmin ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'}`}>
                                        {u.isAdmin ? t("admin.adminRole") : t("admin.userRole")}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill px-3 ${u.isBlocked ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'}`}>
                                        {u.isBlocked ? t("admin.blockedStatus") : t("admin.activeStatus")}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}