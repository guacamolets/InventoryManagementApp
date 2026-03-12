import { useEffect, useState } from "react";
import api from "../../api/api";
import CustomIdConstructor from "../CustomIdConstructor";

export default function SettingsTab({ inventory }) {
    const [accessList, setAccessList] = useState([]);
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSaveTemplate = async (templateJson) => {
        setIsSaving(true);
        try {
            const payload = {
                title: inventory.title || "Untitled",
                description: inventory.description || "",
                category: inventory.category || "General",
                isPublic: !!inventory.isPublic,
                customIdTemplate: templateJson
            };
            await api.put(`/inventories/${inventory.id}`, payload);
        } catch (err) {
            console.error("Failed to save template", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container-fluid">
            <h4 className="mb-3">Settings</h4>

            <div className="card mb-3">
                <div className="card-header bg-light fw-bold">Access Control</div>
                <ul className="list-group list-group-flush">
                    {accessList.length === 0 && (
                        <li className="list-group-item text-muted">No users with access</li>
                    )}
                    {accessList.map(u => (
                        <li key={u.id} className="list-group-item">
                            {u.userName} <span className="badge bg-info ms-2">{u.role}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card mb-3 border-primary">
                <div className="card-header bg-primary text-white fw-bold">
                    Custom ID Generator Strategy
                </div>
                <div className="card-body">
                    <p className="small text-muted">
                        Configure how IDs are generated for new items in this inventory.
                        Changes will not affect existing items.
                    </p>
                    <CustomIdConstructor
                        initialTemplate={inventory.customIdTemplate}
                        onSave={handleSaveTemplate}
                        lastSequenceNumber={inventory.lastSequenceNumber}
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-header fw-bold">Current Items Preview</div>
                <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-sm mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Custom ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(i => (
                                <tr key={i.id}>
                                    <td>{i.name}</td>
                                    <td><code className="text-primary">{i.customId}</code></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-header fw-bold">Statistics</div>
                <div className="card-body">
                    {stats ? (
                        <ul className="mb-0">
                            <li>Total items: <strong>{stats.count}</strong></li>
                            <li>Name length avg: {stats.nameAvg} <small className="text-muted">({stats.nameRange})</small></li>
                            <li>Description length avg: {stats.descAvg} <small className="text-muted">({stats.descRange})</small></li>
                        </ul>
                    ) : (
                        <p>Loading stats...</p>
                    )}
                </div>
            </div>
        </div>
    );
}