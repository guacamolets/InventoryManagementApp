import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import SortableTable from "../components/SortableTable";

export default function UserPage() {
    const { t } = useTranslation();
    const [owned, setOwned] = useState([]);
    const [writable, setWritable] = useState([]);

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

    const handleDelete = async (id) => {
        if (!window.confirm(t("userPage.confirmDelete"))) return;
        try {
            await api.delete(`/inventories/${id}`);
            loadData();
        } catch (err) {
            alert(t("userPage.deleteError"));
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold">{t("userPage.myInventories")}</h3>
                <button className="btn btn-primary shadow-sm" onClick={handleCreate}>
                    {t("userPage.createBtn")}
                </button>
            </div>

            <SortableTable
                data={owned}
                onDelete={handleDelete}
                isOwner={true}
            />

            <h3 className="mt-5 mb-4 fw-bold">{t("userPage.sharedInventories")}</h3>
            <SortableTable data={writable} isOwner={false} />
        </div>
    );
}