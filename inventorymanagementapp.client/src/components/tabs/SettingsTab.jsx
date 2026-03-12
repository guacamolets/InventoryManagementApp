import { useEffect, useState } from "react";
import api from "../../api/api";

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
                const res = await api.get(`/items/inventories/${inventory.id}/items`);
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
        <div className="container-fluid">
            <h4 className="mb-3">Settings</h4>
            <div className="card mb-3">
                <div className="card-header">Access</div>
                <ul className="list-group list-group-flush">
                    {accessList.length === 0 && (
                        <li className="list-group-item text-muted">No users with access</li>
                    )}
                    {accessList.map(u => (
                        <li key={u.id} className="list-group-item">
                            {u.userName} ({u.role})
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card mb-3">
                <div className="card-header">Custom IDs</div>
                <div className="card-body p-0">
                    <table className="table mb-0">
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
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-header">Statistics</div>
                <div className="card-body">
                    {stats ? (
                        <ul className="mb-0">
                            <li>Total items: {stats.count}</li>
                            <li>Name length avg: {stats.nameAvg} ({stats.nameRange})</li>
                            <li>Description length avg: {stats.descAvg} ({stats.descRange})</li>
                        </ul>
                    ) : (
                        <p>Loading stats...</p>
                    )}
                </div>
            </div>
        </div>
    );
}