import api from "../api/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ItemsTab from "../components/ItemsTab";
import DiscussionTab from "../components/DiscussionTab";
import SettingsTab from "../components/SettingsTab";

export default function InventoryPage() {
    const { id } = useParams();
    const [inventory, setInventory] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/inventories/${id}`);
                setInventory(res.data);
            } catch (err) {
                console.error(err);
                alert("Failed to load inventory");
            }
        }
        load();
    }, [id]);

    if (!inventory) {
        return (
            <div className="container mt-4">
                <div className="spinner-border" />
            </div>
        );
    }

    const canEditSettings =
        inventory.ownerId === localStorage.getItem("userId") ||
        localStorage.getItem("role") === "Admin";

    return (
        <div className="container mt-4">
            <h2>{inventory.title}</h2>
            <p className="text-muted">{inventory.description}</p>
            <ul className="nav nav-tabs mt-4" role="tablist">
                <li className="nav-item">
                    <button
                        className="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#items"
                    >
                        Items
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#discussion"
                    >
                        Discussion
                    </button>
                </li>
                {canEditSettings && (
                    <li className="nav-item">
                        <button
                            className="nav-link"
                            data-bs-toggle="tab"
                            data-bs-target="#settings"
                        >
                            Settings
                        </button>
                    </li>
                )}
            </ul>
            <div className="tab-content mt-3">
                <div className="tab-pane fade show active" id="items">
                    <ItemsTab inventoryId={id} />
                </div>
                <div className="tab-pane fade" id="discussion">
                    <DiscussionTab inventoryId={id} />
                </div>
                {canEditSettings && (
                    <div className="tab-pane fade" id="settings">
                        <SettingsTab inventory={inventory} />
                    </div>
                )}
            </div>
        </div>
    );
}