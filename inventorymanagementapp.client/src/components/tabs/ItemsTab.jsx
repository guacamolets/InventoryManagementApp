import { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import { useTheme } from "../../context/theme/useTheme";
import LikeButton from "../LikeButton";

export default function ItemsTab({ inventoryId }) {
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
            await loadData();
        };
        fetchData();
    }, [loadData]);

    const canWrite = isAuthenticated && (userRole === "Owner" || userRole === "Editor");

    const handleSelect = (id) => {
        if (!canWrite) return;
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const deleteSelected = async () => {
        if (!canWrite) return;
        if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;

        try {
            for (const id of selectedIds) {
                await api.delete(`/items/${id}`);
            }
            setSelectedIds([]);
            loadData();
        } catch (err) {
            alert("Delete failed. Insufficient permissions.");
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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold">Items</h4>
                {canWrite && selectedIds.length > 0 && (
                    <div className="animate__animated animate__fadeIn">
                        <button className="btn btn-danger shadow-sm" onClick={deleteSelected}>
                            Delete Selected ({selectedIds.length})
                        </button>
                    </div>
                )}
            </div>

            {canWrite ? (
                <form className="row g-2 mb-4 p-3 bg-light-subtle rounded border shadow-sm" onSubmit={createItem}>
                    <div className="col-md-4">
                        <input className="form-control" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-success w-100 fw-bold" type="submit">Add Item</button>
                    </div>
                </form>
            ) : (
                !isAuthenticated && (
                    <div className="alert alert-info small py-2 shadow-sm">
                        Please <a href="/login">login</a> to add or manage items.
                    </div>
                )
            )}

            <div className="table-responsive shadow-sm rounded border">
                <table className={`table table-hover align-middle mb-0 ${theme === 'dark' ? 'table-dark' : ''}`}>
                    <thead className={theme === 'dark' ? 'table-dark' : 'table-light'}>
                        <tr>
                            {canWrite && <th style={{ width: "40px" }}></th>}
                            <th className="small text-uppercase opacity-75">ID</th>
                            <th className="small text-uppercase opacity-75">Name</th>
                            <th className="small text-uppercase opacity-75">Description</th>
                            <th className="small text-uppercase opacity-75 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(i => (
                            <tr key={i.id} onClick={() => handleSelect(i.id)} style={{ cursor: canWrite ? "pointer" : "default" }}>
                                {canWrite && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={selectedIds.includes(i.id)}
                                            readOnly
                                        />
                                    </td>
                                )}
                                <td className="font-monospace text-primary small fw-bold">{i.customId}</td>
                                <td className="fw-bold">{i.name}</td>
                                <td className="text-muted small text-truncate" style={{ maxWidth: "300px" }}>{i.description}</td>
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
                    <div className="p-5 text-center text-muted border-top bg-light-subtle">
                        No items found in this inventory.
                    </div>
                )}
            </div>
        </div>
    );
}