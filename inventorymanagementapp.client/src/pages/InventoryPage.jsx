import api from "../api/api";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ItemsTab from "../components/tabs/ItemsTab";
import DiscussionTab from "../components/tabs/DiscussionTab";
import SettingsTab from "../components/tabs/SettingsTab";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import { Helmet } from "react-helmet";

export default function InventoryPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [inventory, setInventory] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/inventories/${id}`);
                setInventory(res.data);
            } catch (err) {
                console.error(err);
                toast.error(t("inventory.loadError"));
            }
        }
        load();
    }, [id, t]);

    const handleInventoryUpdate = (updatedInventory) => {
        setInventory(updatedInventory);
    };

    if (!inventory) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("common.loading")}</span>
                </div>
            </div>
        );
    }

    const canEditSettings =
        inventory.ownerId === localStorage.getItem("userId") ||
        localStorage.getItem("role") === "Admin";

    return (
        <div className="container mt-4">
            <Helmet>
                <title>{inventory.title}</title>
            </Helmet>

            <h2 className="fw-bold">{inventory.title}</h2>
            <p style={{ color: 'var(--text)', opacity: 0.7, lineHeight: '1.5' }} className="mb-0">
                {inventory.description}
            </p>

            <ul className="nav nav-tabs mt-4" role="tablist">
                <li className="nav-item">
                    <button
                        className="nav-link active"
                        data-bs-toggle="tab"
                        data-bs-target="#items"
                        type="button"
                    >
                        {t("inventory.tabs.items")}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className="nav-link"
                        data-bs-toggle="tab"
                        data-bs-target="#discussion"
                        type="button"
                    >
                        {t("inventory.tabs.discussion")}
                    </button>
                </li>
                {canEditSettings && (
                    <li className="nav-item">
                        <button
                            className="nav-link"
                            data-bs-toggle="tab"
                            data-bs-target="#settings"
                            type="button"
                        >
                            {t("inventory.tabs.settings")}
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
                        <SettingsTab inventory={inventory} onUpdate={handleInventoryUpdate} />
                    </div>
                )}
            </div>
        </div>
    );
}