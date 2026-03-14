import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../../api/api";
import { useTranslation } from "react-i18next";

export default function DiscussionTab({ inventoryId }) {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const loadData = useCallback(async () => {
        try {
            const res = await api.get(`/discussions/${inventoryId}`);
            setPosts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load posts", err);
        }
    }, [inventoryId]);

    useEffect(() => {
        const fetchData = async () => {
            loadData();
        };
        fetchData();
        const interval = setInterval(loadData, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [posts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        try {
            await api.post(`/discussions`, {
                inventoryId: inventoryId,
                text: newPost
            });
            setNewPost("");
            loadData();
        } catch (err) {
            console.error("Failed to post message", err);
        }
    };

    if (loading) {
        return <div className="p-3 text-center text-muted">{t("discussion.loading")}</div>;
    }

    return (
        <div className="d-flex flex-column h-100">
            <h4 className="mb-3 px-3 fw-bold">{t("discussion.title")}</h4>
            <div
                ref={scrollRef}
                className="flex-grow-1 overflow-auto mb-3 px-3"
                style={{ maxHeight: "500px", borderBottom: "1px solid #eee" }}
            >
                {posts.length === 0 ? (
                    <div className="text-center text-muted my-5">
                        {t("discussion.noPosts")}
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="card mb-2 border-0 shadow-sm">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Link
                                        to={`/profile/${post.userId}`}
                                        className="fw-bold text-decoration-none text-primary"
                                    >
                                        @{post.userName}
                                    </Link>
                                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        {new Date(post.createdAt).toLocaleString()}
                                    </small>
                                </div>
                                <div className="markdown-content text-break">
                                    <ReactMarkdown>{post.text}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={handleSubmit} className="px-3 pb-3">
                <div className="mb-2">
                    <textarea
                        className="form-control"
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        rows={3}
                        placeholder={t("discussion.placeholder")}
                    />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted opacity-75 small">
                        {t("discussion.markdownHint")}
                    </small>
                    <button
                        className="btn btn-primary px-4 shadow-sm"
                        type="submit"
                        disabled={!newPost.trim()}
                    >
                        {t("discussion.sendBtn")}
                    </button>
                </div>
            </form>
        </div>
    );
}