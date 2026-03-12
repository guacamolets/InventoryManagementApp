import { useEffect, useState } from "react";
import api from "../../api/api";
import { useTheme } from "../../context/theme/useTheme";

export default function ItemsTab({ inventoryId }) {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const { theme } = useTheme();

    const loadItems = async () => {
        const res = await api.get(`/items/inventories/${inventoryId}/items`);
        setItems(res.data);
    };

    useEffect(() => {
        const loadItems = async () => {
            const res = await api.get(`/items/inventories/${inventoryId}/items`);
            setItems(res.data);
        };
        loadItems();
    }, [inventoryId]);

    const createItem = async (e) => {
        e.preventDefault();

        if (!name.trim()) return;

        await api.post("/items", {
            inventoryId,
            name,
            description
        });

        setName("");
        setDescription("");
        loadItems();
    };

    const deleteItem = async (id) => {
        if (!window.confirm("Delete this item?")) return;

        await api.delete(`/items/${id}`);
        loadItems();
    };

    return (
        <div className="container-fluid">
            <h4 className="mb-3">Items</h4>
            <form className="row g-2 mb-4" onSubmit={createItem}>
                <div className="col-md-4">
                    <input
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div className="col-md-5">
                    <input
                        className="form-control"
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <button className="btn btn-primary w-100" type="submit">
                        Add Item
                    </button>
                </div>
            </form>
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className={theme === "light" ? "table table-light" : "table table-dark"}>
                        <tr>
                            <th>Custom ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th style={{ width: "120px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(i => (
                            <tr key={i.id}>
                                <td>{i.customId}</td>
                                <td>{i.name}</td>
                                <td>{i.description}</td>

                                <td>
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteItem(i.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="4" className="text-center text-muted">No items yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}