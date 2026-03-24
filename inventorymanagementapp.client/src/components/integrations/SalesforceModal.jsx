import React, { useState } from 'react';

const SalesforceModal = () => {
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
                alert("Successfully synced with Salesforce");
                setIsOpen(false);
            } else {
                const err = await response.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            alert("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => setIsOpen(true)}>Связать профиль с CRM</button>

            {isOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ padding: '20px', border: '1px solid #ccc', background: '#fff' }}>
                        <h3>Additional information</h3>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Company" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
                            <input type="text" placeholder="First name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                            <input type="text" placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

                            <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send to Salesforce"}</button>
                            <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesforceModal;