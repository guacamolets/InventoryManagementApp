import React, { useState } from 'react';

const SupportTicketModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [summary, setSummary] = useState('');
    const [priority, setPriority] = useState('Average');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const ticketData = {
            Summary: summary,
            Priority: priority,
            CurrentPageUrl: window.location.href,
            InventoryTitle: document.title || "Main Page"
        };

        try {
            const response = await fetch('/api/supportticket/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(ticketData)
            });

            if (response.ok) {
                alert('Ticket submitted successfully!');
                setIsOpen(false);
                setSummary('');
            } else {
                alert('Failed to submit ticket.');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, borderRadius: '50%', width: '60px', height: '60px', backgroundColor: '#0078d4', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
                Help
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ marginTop: 0 }}>Create Support Ticket</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Priority:</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="High">High</option>
                                    <option value="Average">Average</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Summary:</label>
                                <textarea
                                    required
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    style={{ width: '100%', height: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }}
                                    placeholder="Describe your problem..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    style={{ padding: '8px 15px', border: 'none', backgroundColor: '#eee', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ padding: '8px 15px', border: 'none', backgroundColor: '#0078d4', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    {loading ? 'Sending...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SupportTicketModal;