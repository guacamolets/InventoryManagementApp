import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../../api/api";

export default function DiscussionTab({ inventoryId }) {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            const res = await api.get(`/discussions/${inventoryId}`);
            setPosts(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load posts", err);
        }
    };

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const res = await api.get(`/discussions/${inventoryId}`);
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
            await api.post(`/discussions/${inventoryId}`, { content: newPost });
            setNewPost("");
            loadPosts();
        } catch (err) {
            console.error("Failed to post message", err);
        }
    };

    if (loading) return <div>Loading discussion...</div>;

    return (
        <div className="container-fluid">
            <h4 className="mb-3">Discussion</h4>
            <div className="mb-3">
                {posts.length === 0 && (
                    <div className="text-muted">No posts yet</div>
                )}
                {posts.map(post => (
                    <div key={post.id} className="card mb-2">
                        <div className="card-body p-2">
                            <div className="d-flex justify-content-between mb-1">
                                <strong>{post.userName}</strong>
                                <small className="text-muted">
                                    {new Date(post.createdAt).toLocaleString()}
                                </small>
                            </div>
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <textarea
                        className="form-control"
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        rows={3}
                        placeholder="Write your post in Markdown..."
                    />
                </div>
                <button className="btn btn-primary" type="submit">Post</button>
            </form>
        </div>
    );
}