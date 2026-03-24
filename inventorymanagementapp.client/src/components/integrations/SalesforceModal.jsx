import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';

const SalesforceModal = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ companyName: '', firstName: '', lastName: '', email: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/salesforce/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                toast.success(t('crm.success_alert'));
                setIsOpen(false);
                setFormData({ companyName: '', firstName: '', lastName: '', email: '' });
            } else {
                const err = await response.json();
                toast.error(t('crm.error_prefix') + (err.message || t('crm.error_default')));
            }
        } catch (error) {
            toast.error(t('common.connection_error'));
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
        marginBottom: '15px',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '500',
        color: 'var(--text)'
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <button
                onClick={() => setIsOpen(true)}
                style={{ padding: '10px 20px', backgroundColor: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
            >
                {t('crm.link_profile_btn')}
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
                    <div style={{
                        backgroundColor: 'var(--bg)', padding: '30px', borderRadius: '8px', width: '400px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--text)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>{t('crm.title')}</h2>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <label style={labelStyle}>{t('crm.company')}:</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    placeholder="e.g. Microsoft"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>{t('crm.first_name')}:</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>{t('crm.last_name')}:</label>
                                    <input
                                        type="text"
                                        style={inputStyle}
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>{t('crm.email')}:</label>
                                <input
                                    type="email"
                                    style={inputStyle}
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
                                    style={{ padding: '8px 15px', border: 'none', backgroundColor: '#0078d4', color: 'white', cursor: 'pointer', borderRadius: '4px', minWidth: '100px' }}
                                >
                                    {loading ? t('common.sending') : t('crm.sync_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesforceModal;