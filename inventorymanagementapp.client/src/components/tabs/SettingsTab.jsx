import { useEffect, useState } from "react";
import api from "../../api/api";
import CustomIdConstructor from "../CustomIdConstructor";

export default function SettingsTab({ inventory }) {
    const [title, setTitle] = useState(inventory.title || "");
    const [description, setDescription] = useState(inventory.description || "");
    const [isPublic, setIsPublic] = useState(!!inventory.isPublic);
    const [category, setCategory] = useState(inventory.category || "General");

    const [accessList, setAccessList] = useState([]);
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(inventory.title || "");
        setDescription(inventory.description || "");
        setIsPublic(!!inventory.isPublic);
        setCategory(inventory.category || "General");

        const loadAccessList = async () => {
            try {
                const res = await api.get(`/inventories/${inventory.id}/access`);
                setAccessList(res.data);
            } catch (err) { console.error("Failed to load access list", err); }
        };

        const loadItems = async () => {
            try {
                const res = await api.get(`/items/inventories/${inventory.id}/items`);
                setItems(res.data);
                if (res.data.length > 0) {
                    const count = res.data.length;
                    const nameLengths = res.data.map(i => i.name?.length || 0);
                    const descLengths = res.data.map(i => i.description?.length || 0);
                    setStats({
                        count,
                        nameAvg: (nameLengths.reduce((a, b) => a + b, 0) / count).toFixed(1),
                        descAvg: (descLengths.reduce((a, b) => a + b, 0) / count).toFixed(1),
                        nameRange: `${Math.min(...nameLengths)} - ${Math.max(...nameLengths)}`,
                        descRange: `${Math.min(...descLengths)} - ${Math.max(...descLengths)}`
                    });
                }
            } catch (err) { console.error("Failed to load items", err); }
        };

        loadAccessList();
        loadItems();
    }, [inventory]);

    const handleSaveSettings = async (templateToSave = inventory.customIdTemplate) => {
        setIsSaving(true);
        try {
            const payload = {
                title: title,
                description: description,
                category: category,
                isPublic: isPublic,
                customIdTemplate: templateToSave
            };
            await api.put(`/inventories/${inventory.id}`, payload);
            alert("Settings updated successfully!");
        } catch (err) {
            console.error("Failed to save settings", err);
            alert("Error saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container-fluid">
            <h4 className="mb-3">Inventory Settings</h4>

            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-dark text-white fw-bold">General Information</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label fw-bold">Title</label>
                        <input
                            className="form-control"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Description (Markdown supported)</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-check form-switch mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="publicSwitch"
                            checked={isPublic}
                            onChange={e => setIsPublic(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="publicSwitch">Public Access</label>
                    </div>
                    <button
                        className="btn btn-success"
                        onClick={() => handleSaveSettings()}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save General Settings"}
                    </button>
                </div>
            </div>

            <div className="card mb-4 border-primary shadow-sm">
                <div className="card-header bg-primary text-white fw-bold">
                    Custom ID Generator Strategy
                </div>
                <div className="card-body">
                    <CustomIdConstructor
                        initialTemplate={inventory.customIdTemplate}
                        onSave={handleSaveSettings}
                        lastSequenceNumber={inventory.lastSequenceNumber}
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header bg-light fw-bold">Access Control</div>
                        <ul className="list-group list-group-flush">
                            {accessList.length === 0 && <li className="list-group-item text-muted">No users</li>}
                            {accessList.map(u => (
                                <li key={u.id} className="list-group-item d-flex justify-content-between">
                                    {u.userName} <span className="badge bg-info">{u.role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header fw-bold">Statistics</div>
                        <div className="card-body">
                            {stats ? (
                                <ul className="list-unstyled mb-0">
                                    <li>Items count: <strong>{stats.count}</strong></li>
                                    <li>Avg Name: {stats.nameAvg} <small>({stats.nameRange})</small></li>
                                    <li>Avg Desc: {stats.descAvg} <small>({stats.descRange})</small></li>
                                </ul>
                            ) : <p>No items yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}