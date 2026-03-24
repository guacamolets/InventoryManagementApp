import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import api from "../../api/api";
import { useTheme } from "../../context/theme/useTheme";
import LikeButton from "../LikeButton";

export default function ItemsTab({ inventoryId }) {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState("Viewer");

    const { theme } = useTheme();

    const loadData = useCallback(async () => {
        try {
            const [itemsRes, authRes] = await Promise.all([
                api.get(`/items/inventories/${inventoryId}/items?_=${Date.now()}`),
                api.get(`/inventories/${inventoryId}/access-level`).catch(() => ({ data: { role: "Viewer" } }))
            ]);
            setItems(itemsRes.data);
            setUserRole(authRes.data.role);
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Fetch error:", err);
            if (err.response?.status === 401) setIsAuthenticated(false);
        }
    }, [inventoryId]);

    useEffect(() => {
        const fetchData = async () => {
            loadData();
        };
        fetchData();
    }, []);

    const canWrite = isAuthenticated && (userRole === "Owner" || userRole === "Editor");

    const handleSelect = (id) => {
        if (!canWrite) return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const deleteSelected = async () => {
        if (!canWrite) return;
        if (!window.confirm(t("items.confirmDelete", { count: selectedIds.length }))) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/items/${id}`)));
            setSelectedIds([]);
            loadData();
        } catch (err) {
            toast.error(t("items.deleteError"));
        }
    };

    const createItem = async (e) => {
        e.preventDefault();
        if (!canWrite || !name.trim()) return;
        try {
            await api.post("/items", { inventoryId, name, description });
            setName("");
            setDescription("");
            loadData();
        } catch (err) {
            console.error("Create failed:", err.response?.data);
        }
    };

    return (
        <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>{t("items.title")}</h4>
                {canWrite && selectedIds.length > 0 && (
                    <div className="animate__animated animate__fadeIn">
                        <button className="btn btn-danger btn-sm shadow-sm rounded-pill px-4 fw-bold" onClick={deleteSelected}>
                            {t("items.deleteSelectedBtn", { count: selectedIds.length })}
                        </button>
                    </div>
                )}
            </div>

            {canWrite ? (
                <form
                    className="row g-2 mb-4 p-3 rounded border shadow-sm"
                    onSubmit={createItem}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'var(--bs-border-color)' }}
                >
                    <div className="col-md-4">
                        <input
                            className="form-control"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderColor: 'var(--bs-border-color)' }}
                            placeholder={t("items.namePlaceholder")}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <input
                            className="form-control"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderColor: 'var(--bs-border-color)' }}
                            placeholder={t("items.descPlaceholder")}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-success w-100 fw-bold rounded-pill" type="submit">
                            {t("items.addBtn")}
                        </button>
                    </div>
                </form>
            ) : (
                !isAuthenticated && (
                    <div className="alert alert-info border-0 small py-2 shadow-sm mb-4">
                        {t("items.loginNotice")} <a href="/login" className="alert-link">{t("items.loginLink")}</a> {t("items.loginNoticeEnd")}
                    </div>
                )
            )}

            <div className="table-responsive shadow-sm rounded border" style={{ borderColor: 'var(--bs-border-color)' }}>
                <table className={`table table-hover align-middle mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
                    <thead className={theme === 'dark' ? 'table-dark' : 'table-light'}>
                        <tr>
                            {canWrite && <th style={{ width: "45px" }} className="px-3 text-center">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={items.length > 0 && selectedIds.length === items.length}
                                    onChange={() => setSelectedIds(selectedIds.length === items.length ? [] : items.map(i => i.id))}
                                />
                            </th>}
                            <th className="small text-uppercase fw-bold opacity-75 px-3">{t("items.colId")}</th>
                            <th className="small text-uppercase fw-bold opacity-75">{t("items.colName")}</th>
                            <th className="small text-uppercase fw-bold opacity-75">{t("items.colDesc")}</th>
                            <th className="small text-uppercase fw-bold opacity-75 text-center">{t("items.colActions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(i => (
                            <tr
                                key={i.id}
                                onClick={() => handleSelect(i.id)}
                                style={{ cursor: canWrite ? "pointer" : "default" }}
                                className={selectedIds.includes(i.id) ? 'table-active' : ''}
                            >
                                {canWrite && (
                                    <td className="px-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.includes(i.id)}
                                            readOnly
                                        />
                                    </td>
                                )}
                                <td className="px-3">
                                    <span className="badge bg-primary-subtle text-primary font-monospace border border-primary-subtle" style={{ fontSize: '0.75rem' }}>
                                        #{i.customId}
                                    </span>
                                </td>
                                <td className="fw-bold" style={{ color: 'var(--text)' }}>{i.name}</td>
                                <td
                                    className="small text-truncate"
                                    style={{ maxWidth: "300px", color: 'var(--text)', opacity: 0.85 }}
                                >
                                    {i.description}
                                </td>
                                <td className="text-center">
                                    <LikeButton
                                        itemId={i.id}
                                        initialLikes={i.likesCount || 0}
                                        initialIsLiked={i.isLiked}
                                        isAuthenticated={isAuthenticated}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.length === 0 && (
                    <div className="p-5 text-center border-top" style={{ color: 'var(--text)', opacity: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        {t("items.emptyList")}
                    </div>
                )}
            </div>
        </div>
    );
}