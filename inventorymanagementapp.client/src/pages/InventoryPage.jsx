import api from "../api/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function InventoryPage() {
    const { id } = useParams();

    const [inventory, setInventory] = useState(null);
    const [tab, setTab] = useState("items");

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

    if (!inventory) return <div>Loading...</div>;

    const canEditSettings =
        inventory.ownerId === localStorage.getItem("userId") ||
        localStorage.getItem("role") === "Admin";

    const tabs = {
        items: <ItemsTab inventoryId={id} />,
        discussion: <DiscussionTab inventoryId={id} />,
        settings: <SettingsTab inventory={inventory} />
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>{inventory.title}</h1>
            <p>{inventory.description}</p>

            <div style={{ marginTop: 20 }}>
                <button onClick={() => setTab("items")}>Items</button>
                <button onClick={() => setTab("discussion")}>Discussion</button>
                {canEditSettings && (
                    <button onClick={() => setTab("settings")}>Settings</button>
                )}
            </div>

            <div style={{ marginTop: 20 }}>
                {tabs[tab]}
            </div>
        </div>
    );
}