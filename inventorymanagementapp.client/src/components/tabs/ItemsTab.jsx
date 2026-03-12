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
    const { theme } = useTheme();

    const loadItems = useCallback(async () => {
        try {
            const res = await api.get(`/items/inventories/${inventoryId}/items?_=${Date.now()}`);
            setItems(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }, [inventoryId]);

    useEffect(() => {
        const fetchData = async () => {
            await loadItems();
        };
        fetchData();
    }, [loadItems]);

    useEffect(() => {
        api.get("/auth/me")
            .then(() => setIsAuthenticated(true))
            .catch(() => setIsAuthenticated(false));
    }, []);

    const handleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const deleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;

        try {
            for (const id of selectedIds) {
                await api.delete(`/items/${id}`);
            }
            setSelectedIds([]);
            loadItems();
        } catch (err) {
            alert("Delete failed. Maybe you don't have write access?");
        }
    };

    const createItem = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            const res = await api.post("/items", { inventoryId, name, description });
            setName("");
            setDescription("");
            setItems(prevItems => [...prevItems, res.data]);
            loadItems();
        } catch (err)
        {
            console.error(err);
            console.error("Server Error Details:", err.response?.data);
        }
    };

    return (
        <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Items</h4>
                {selectedIds.length > 0 && (
                    <div className="animate__animated animate__fadeIn">
                        <button className="btn btn-danger" onClick={deleteSelected}>
                            Delete Selected ({selectedIds.length})
                        </button>
                    </div>
                )}
            </div>

            <form className="row g-2 mb-4 p-3 bg-light rounded border" onSubmit={createItem}>
                <div className="col-md-4">
                    <input className="form-control" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="col-md-6">
                    <input className="form-control" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="col-md-2">
                    <button className="btn btn-success w-100" type="submit">Add</button>
                </div>
            </form>

            <div className="table-responsive shadow-sm rounded">
                <table className={`table table-hover align-middle ${theme === 'dark' ? 'table-dark' : ''}`}>
                    <thead className="table-secondary">
                        <tr>
                            <th style={{ width: "40px" }}></th>
                            <th>Custom ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Likes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(i => (
                            <tr key={i.id} onClick={() => handleSelect(i.id)} style={{ cursor: "pointer" }}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={selectedIds.includes(i.id)}
                                        onChange={() => { }}
                                    />
                                </td>
                                <td className="font-monospace text-primary small">{i.customId || "GEN-001"}</td>
                                <td className="fw-bold">{i.name}</td>
                                <td className="text-truncate" style={{ maxWidth: "200px" }}>{i.description}</td>
                                <td>
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
                {items.length === 0 && <div className="p-5 text-center text-muted">No items in this inventory.</div>}
            </div>
        </div>
    );
}