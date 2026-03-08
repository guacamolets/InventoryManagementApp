import { useEffect, useState } from "react";
import api from "../api";

export default function ItemsTab({ inventoryId }) {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const load = async () => {
            const res = await api.get(`/items/inventory/${inventoryId}`);
            setItems(res.data);
        };
        load();
    }, [inventoryId]);

    const load = async () => {
        const res = await api.get(`/items/inventory/${inventoryId}`);
        setItems(res.data);
    };

    const createItem = async () => {
        await api.post("/items", {
            inventoryId,
            name,
            description
        });

        setName("");
        setDescription("");

        load();
    };

    const deleteItem = async (id) => {
        await api.delete(`/items/${id}`);
        load();
    };

    return (
        <div>
            <h3>Items</h3>

            <div style={{ marginBottom: 20 }}>
                <input
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <input
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />

                <button onClick={createItem}>
                    Add
                </button>
            </div>

            <table border="1" cellPadding="5">
                <thead>
                    <tr>
                        <th>Custom ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {items.map(i => (
                        <tr key={i.id}>
                            <td>{i.customId}</td>
                            <td>{i.name}</td>
                            <td>{i.description}</td>

                            <td>
                                <button onClick={() => deleteItem(i.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}