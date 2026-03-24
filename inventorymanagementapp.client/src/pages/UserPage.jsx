import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import SortableTable from "../components/SortableTable";
import SalesforceModal from "../components/SalesforceModal";

export default function UserPage() {
    const { t } = useTranslation();
    const [owned, setOwned] = useState([]);
    const [writable, setWritable] = useState([]);
    const [isSfModalOpen, setIsSfModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const ownedRes = await api.get("/user/owned");
            const writableRes = await api.get("/user/writable");
            setOwned(ownedRes.data);
            setWritable(writableRes.data);
        } catch (err) {
            console.error("Failed to load inventories", err);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            loadData();
        };
        fetchData();
    }, []);

    const handleCreate = async () => {
        const title = prompt(t("userPage.promptTitle"));
        if (!title) return;
        try {
            await api.post("/inventories", {
                title,
                description: "",
                category: "General",
                customIdTemplate: "[]"
            });
            loadData();
        } catch (err) {
            alert(t("userPage.createError"));
        }
    };

    const handleDelete = async (ids) => {
        const idsArray = Array.isArray(ids) ? ids : [ids];
        if (!window.confirm(t("table.confirmDelete", { count: idsArray.length }))) return;
        await Promise.all(idsArray.map(id => api.delete(`/inventories/${id}`)));
        loadData();
    };

    const handleCopyToken = async (inventoryId) => {
        try {
            const response = await api.post(`/inventories/${inventoryId}/generate-token`);
            const token = response.data.token;

            await navigator.clipboard.writeText(token);
            alert("The token has been copied to your clipboard! Paste it into Odoo.");
        } catch (err) {
            alert("Error generating token");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">{t("userPage.myInventories")}</h3>
                <div>
                    <button
                        className="btn btn-outline-cloud secondary shadow-sm me-2"
                        style={{ borderColor: '#00a1e0', color: '#00a1e0' }}
                        onClick={() => setIsSfModalOpen(true)}
                    >
                        <i className="bi bi-cloud-upload me-1"></i> CRM Sync
                    </button>

                    <button className="btn btn-primary shadow-sm" onClick={handleCreate}>
                        {t("userPage.createBtn")}
                    </button>
                </div>
            </div>

            <SortableTable data={owned} onDelete={handleDelete} handleCopyToken={handleCopyToken} isOwner={true}/>

            <h3 className="mt-5 mb-4 fw-bold">{t("userPage.sharedInventories")}</h3>
            <SortableTable data={writable} isOwner={false} />

            {isSfModalOpen && (
                <SalesforceModal onClose={() => setIsSfModalOpen(false)} />
            )}
        </div>
    );
}