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
            className="btn btn-sm d-inline-flex align-items-center justify-content-center transition-all"
            onClick={toggleLike}
            disabled={loading}
            style={{
                border: 'none',
                background: 'transparent',
                color: isLiked ? '#dc3545' : 'var(--text)',
                opacity: isLiked ? 1 : 0.6,
                padding: '4px 10px',
                borderRadius: '20px',
                transition: 'all 0.2s ease-in-out'
            }}

            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                e.currentTarget.style.opacity = 1;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                if (!isLiked) e.currentTarget.style.opacity = 0.6;
            }}
        >
            <div className={`d-flex align-items-center ${loading ? 'opacity-50' : ''}`}>
                {isLiked ? (
                    <HeartFill size={18} className="animate__animated animate__heartBeat" />
                ) : (
                    <Heart size={18} strokeWidth={2} />
                )}
                <span className="ms-2 fw-bold" style={{ fontSize: '0.9rem' }}>
                    {likes}
                </span>
            </div>
        </button>
    );
}