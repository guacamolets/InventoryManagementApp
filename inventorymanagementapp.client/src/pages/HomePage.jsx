import { useEffect, useState } from "react";
import api from "../api/api";

export default function HomePage() {
    const [latest, setLatest] = useState([]);
    const [top, setTop] = useState([]);
    const [tags, setTags] = useState([]);

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
        <div style={{ padding: 20 }}>
            <h2>Latest inventories</h2>

            <ul>
                {latest.map(i => (
                    <li key={i.id}>{i.title}</li>
                ))}
            </ul>

            <h2>Top 5 inventories</h2>

            <ul>
                {top.map(i => (
                    <li key={i.id}>{i.title}</li>
                ))}
            </ul>

            <div className="tag-cloud">
                {tags.map(t => (
                    <span
                        key={t.name}
                        style={{ fontSize: `${12 + t.count * 2}px`, marginRight: "10px" }}
                    >
                        #{t.name}
                    </span>
                ))}
            </div>
        </div>
    );
}