import { useState } from "react";
import api from "../api/api";
import { Heart, HeartFill } from "react-bootstrap-icons";

export default function LikeButton({ itemId, initialLikes, initialIsLiked, isAuthenticated }) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [loading, setLoading] = useState(false);

    const toggleLike = async (e) => {
        e.stopPropagation();

        if (!isAuthenticated) {
            alert("Please login to like items!");
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            const res = await api.post(`/items/${itemId}/like`);
            setLikes(res.data.likesCount);
            setIsLiked(res.data.isLiked);
        } catch (err) {
            console.error("Like error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`btn btn-sm ${isLiked ? "text-danger" : "text-muted"}`}
            onClick={toggleLike}
            disabled={loading}
            title={isLiked ? "Unlike" : "Like"}
        >
            {isLiked ? <HeartFill size={18} /> : <Heart size={18} />}
            <span className="ms-1 fw-bold">{likes}</span>
        </button>
    );
}