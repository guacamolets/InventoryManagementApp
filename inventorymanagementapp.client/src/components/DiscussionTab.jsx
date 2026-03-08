import { useEffect, useState } from "react";
import api from "../api";
import ReactMarkdown from "react-markdown";

export default function DiscussionTab({ inventoryId }) {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            const res = await api.get(`/discussion/${inventoryId}`);
            setPosts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load posts", err);
        }
    };

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const res = await api.get(`/discussion/${inventoryId}`);
                setPosts(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load posts", err);
            }
        };

        loadPosts();

        const interval = setInterval(loadPosts, 3000);
        return () => clearInterval(interval);
    }, [inventoryId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            await api.post(`/discussion/${inventoryId}`, { content: newPost });
            setNewPost("");
            loadPosts();
        } catch (err) {
            console.error("Failed to post message", err);
        }
    };

    if (loading) return <div>Loading discussion...</div>;

    return (
        <div>
            <h3>Discussion</h3>

            <div style={{ marginBottom: 20 }}>
                {posts.map(post => (
                    <div key={post.id} style={{ padding: 10, border: "1px solid #ccc", marginBottom: 5 }}>
                        <div style={{ fontSize: 12, color: "#555" }}>
                            <b>{post.userName}</b> — {new Date(post.userName).toLocaleString()}
                        </div>
                        <ReactMarkdown>{post.text}</ReactMarkdown>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    rows={3}
                    style={{ width: "100%" }}
                    placeholder="Write your post in Markdown..."
                />
                <button type="submit" style={{ marginTop: 5 }}>Post</button>
            </form>
        </div>
    );
}