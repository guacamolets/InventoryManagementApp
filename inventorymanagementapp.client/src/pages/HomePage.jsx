import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useTranslation } from "react-i18next";

export default function HomePage() {
    const { t } = useTranslation();
    const [latest, setLatest] = useState([]);
    const [top, setTop] = useState([]);
    const [tags, setTags] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const latestRes = await api.get("/inventories/latest");
                const topRes = await api.get("/inventories/top");
                const tagsRes = await api.get("/inventories/tags/cloud");

                setLatest(latestRes.data);
                setTop(topRes.data);
                setTags(tagsRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        load();
    }, []);

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6">
                    <h4 className="mb-3">{t("home.latestInventories")}</h4>
                    <div className="list-group">
                        {latest.map(i => (
                            <button
                                key={i.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => navigate(`/inventories/${i.id}`)}
                            >
                                {i.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-md-6">
                    <h4 className="mb-3">{t("home.topInventories")}</h4>
                    <div className="list-group">
                        {top.map(i => (
                            <button
                                key={i.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => navigate(`/inventories/${i.id}`)}
                            >
                                {i.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <h4 className="mb-3">{t("home.popularTags")}</h4>
                <div className="d-flex flex-wrap gap-2">
                    {tags.map(t => (
                        <span
                            key={t.name}
                            className="badge bg-secondary"
                            style={{ fontSize: `${12 + t.count * 2}px` }}
                        >
                            #{t.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}