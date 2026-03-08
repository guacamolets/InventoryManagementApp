import { useEffect, useState } from "react";
import api from "../api";

export default function SettingsTab({ inventory }) {
    const [accessList, setAccessList] = useState([]);
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const loadAccessList = async () => {
            try {
                const res = await api.get(`/inventories/${inventory.id}/access`);
                setAccessList(res.data);
            } catch (err) {
                console.error("Failed to load access list", err);
            }
        };
        const loadItems = async () => {
            try {
                const res = await api.get(`/items/inventory/${inventory.id}`);
                setItems(res.data);

                const count = res.data.length;
                const nameLengths = res.data.map(i => i.name.length);
                const descLengths = res.data.map(i => i.description.length);
                setStats({
                    count,
                    nameAvg: (nameLengths.reduce((a, b) => a + b, 0) / count).toFixed(1),
                    descAvg: (descLengths.reduce((a, b) => a + b, 0) / count).toFixed(1),
                    nameRange: `${Math.min(...nameLengths)} - ${Math.max(...nameLengths)}`,
                    descRange: `${Math.min(...descLengths)} - ${Math.max(...descLengths)}`
                });
            } catch (err) {
                console.error("Failed to load items", err);
            }
        };
        loadAccessList();
        loadItems();
    }, [inventory.id]);

    return (
        <div>
            <h3>Settings</h3>

            <section>
                <h4>Access</h4>
                <ul>
                    {accessList.map(u => (
                        <li key={u.id}>{u.userName} ({u.role})</li>
                    ))}
                </ul>
            </section>

            <section>
                <h4>Custom IDs</h4>
                <table border="1" cellPadding="5">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Custom ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(i => (
                            <tr key={i.id}>
                                <td>{i.name}</td>
                                <td>{i.customId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h4>Statistics</h4>
                {stats ? (
                    <ul>
                        <li>Total items: {stats.count}</li>
                        <li>Name length avg: {stats.nameAvg} ({stats.nameRange})</li>
                        <li>Description length avg: {stats.descAvg} ({stats.descRange})</li>
                    </ul>
                ) : (
                    <p>Loading stats...</p>
                )}
            </section>
        </div>
    );
}