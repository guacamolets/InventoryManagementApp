import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

const SupportTicketModal = () => {
    const { t } = useTranslation();
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
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(ticketData)
            });

            if (response.ok) {
                alert(t('support.success_alert'));
                setIsOpen(false);
                setSummary('');
            } else {
                alert(t('support.error_alert'));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        color: 'var(--text)',
        boxSizing: 'border-box'
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, borderRadius: '50%', width: '60px', height: '60px', backgroundColor: '#0078d4', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
                {t('support.help_btn')}
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
                    <div style={{
                        backgroundColor: 'var(--bg)', padding: '30px', borderRadius: '8px', width: '400px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--text)'
                    }}>
                        <h2 style={{ marginTop: 0 }}>{t('support.title')}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>{t('support.priority')}:</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                                    <option value="High">{t('support.priority_high')}</option>
                                    <option value="Average">{t('support.priority_average')}</option>
                                    <option value="Low">{t('support.priority_low')}</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>{t('support.summary')}:</label>
                                <textarea
                                    required
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                                    placeholder={t('support.summary_placeholder')}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    style={{ padding: '8px 15px', border: 'none', backgroundColor: 'var(--card)', color: 'var(--text)', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ padding: '8px 15px', border: 'none', backgroundColor: '#0078d4', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    {loading ? t('common.sending') : t('common.submit')}
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