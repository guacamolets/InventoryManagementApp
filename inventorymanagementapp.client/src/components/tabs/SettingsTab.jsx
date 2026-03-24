import { useEffect, useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import CreatableSelect from "react-select/creatable";
import api from "../../api/api";
import CustomIdConstructor from "../CustomIdConstructor";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';

export default function SettingsTab({ inventory, onUpdate }) {
    const { t } = useTranslation();

    const [title, setTitle] = useState(inventory.title || "");
    const [description, setDescription] = useState(inventory.description || "");
    const [isPublic, setIsPublic] = useState(!!inventory.isPublic);
    const [category, setCategory] = useState(inventory.category || "General");
    const [imageUrl, setImageUrl] = useState(inventory.imageUrl || "");
    const [selectedTags, setSelectedTags] = useState(inventory.tags?.map(t => ({ value: t.name, label: t.name })) || []);
    const [template, setTemplate] = useState(inventory.customIdTemplate || "");

    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [previewMarkdown, setPreviewMarkdown] = useState(false);
    const [accessList, setAccessList] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [stats, setStats] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState("");
    const [isAddingAccess, setIsAddingAccess] = useState(false);

    const versionRef = useRef(inventory.version || "");
    const currentDataRef = useRef({});

    const categories = [
        { value: "General", label: t("categories.general") },
        { value: "Office", label: t("categories.office") },
        { value: "Library", label: t("categories.library") },
        { value: "Facilities", label: t("categories.facilities") },
        { value: "Archive", label: t("categories.archive") }
    ];

    useEffect(() => {
        currentDataRef.current = { title, description, isPublic, category, imageUrl, selectedTags, template };

        const hasChanges =
            title !== (inventory.title || "") ||
            description !== (inventory.description || "") ||
            isPublic !== !!inventory.isPublic ||
            category !== (inventory.category || "General") ||
            imageUrl !== (inventory.imageUrl || "") ||
            template !== (inventory.customIdTemplate || "") ||
            JSON.stringify(selectedTags.map(t => t.value)) !== JSON.stringify(inventory.tags?.map(t => t.name) || []);

        setIsDirty(hasChanges);
    }, [title, description, isPublic, category, imageUrl, selectedTags, template, inventory]);

    useEffect(() => {
        if (inventory.version) versionRef.current = inventory.version;
    }, [inventory.version]);

    const loadData = useCallback(async () => {
        try {
            console.log("Current Inventory ID:", inventory.id)

            const [accessRes, itemsRes, tagsRes] = await Promise.all([
                api.get(`/inventories/${inventory.id}/access`),
                api.get(`/items/inventories/${inventory.id}/items`),
                api.get("/inventories/tags")
            ]);

            setAccessList(accessRes.data);
            if (tagsRes.data) {
                setAllTags(tagsRes.data.map(tagName => ({ value: tagName, label: tagName })));
            }

            if (itemsRes.data && itemsRes.data.length > 0) {
                const count = itemsRes.data.length;
                const likes = itemsRes.data.map(i => i.likesCount || 0);
                const totalLikes = likes.reduce((a, b) => a + b, 0);
                const mostPopularItem = itemsRes.data.reduce((prev, current) =>
                    (prev.likesCount || 0) > (current.likesCount || 0) ? prev : current
                );

                setStats({
                    count,
                    likesAvg: (totalLikes / count).toFixed(1),
                    mostPopular: mostPopularItem.likesCount > 0 ? mostPopularItem.name : "—"
                });
            }
        } catch (err) { console.error("Load failed", err); }
    }, [inventory.id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSaveSettings = useCallback(async (isAuto = false) => {
        if ((isAuto && !isDirty) || isSaving || !versionRef.current) return;

        setIsSaving(true);
        try {
            const data = currentDataRef.current;
            const payload = {
                title: data.title,
                description: data.description,
                category: data.category,
                isPublic: data.isPublic,
                imageUrl: data.imageUrl,
                tags: data.selectedTags.map(t => t.value),
                customIdTemplate: data.template,
                version: versionRef.current
            };

            const response = await api.put(`/inventories/${inventory.id}`, payload);
            if (response.data?.version) {
                versionRef.current = response.data.version;
                if (onUpdate) {
                    onUpdate({ ...inventory, ...payload, tags: data.selectedTags.map(t => ({ name: t.value })), version: response.data.version });
                }
            }
            setIsDirty(false);
            setLastSaved(new Date().toLocaleTimeString());
        } catch (err) {
            if (err.response?.status === 409 && !isAuto) toast.error(t("settings.conflictError"));
        } finally { setIsSaving(false); }
    }, [inventory, isDirty, isSaving, onUpdate, t]);

    useEffect(() => {
        const timer = setInterval(() => handleSaveSettings(true), 8000);
        return () => clearInterval(timer);
    }, [handleSaveSettings]);

    return (
        <div className="container-fluid pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">{t("settings.title")}</h4>
                <div className="small">
                    {isDirty ? (
                        <span className="badge bg-warning text-dark shadow-sm animate-pulse px-3">{t("settings.unsaved")}</span>
                    ) : (
                        lastSaved && <span className="text-success fw-bold">✓ {t("settings.savedAt", { time: lastSaved })}</span>
                    )}
                </div>
            </div>

            <div className="card mb-4 shadow-sm border-0 overflow-hidden">
                <div className="card-header py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: 'none' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-uppercase small" style={{ letterSpacing: '1px', color: 'var(--text)', opacity: 0.8 }}>
                            {t("settings.sectionGeneral")}
                        </span>
                        {isSaving && <div className="spinner-border spinner-border-sm text-light"></div>}
                    </div>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-7">
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text)', opacity: 0.8 }}>{t("settings.labelTitle")}</label>
                                <input className="form-control border-secondary-subtle" style={{ color: 'var(--text)', opacity: 0.8 }} value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text)', opacity: 0.8 }}>{t("settings.labelDesc")}</label>
                                    <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={() => setPreviewMarkdown(!previewMarkdown)}>
                                        {previewMarkdown ? t("settings.modeEdit") : t("settings.modePreview")}
                                    </button>
                                </div>
                                {previewMarkdown ? (
                                    <div className="p-3 border rounded shadow-inner" style={{ minHeight: "124px", backgroundColor: 'var(--bs-tertiary-bg)'}}>
                                        <ReactMarkdown>{description || t("settings.noDesc")}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea className="form-control border-secondary-subtle" rows="4" value={description} onChange={e => setDescription(e.target.value)} />
                                )}
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text)', opacity: 0.8 }}>{t("settings.labelCategory")}</label>
                                <select className="form-select border-secondary-subtle" value={category} onChange={e => setCategory(e.target.value)}>
                                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text)', opacity: 0.8 }}>{t("settings.labelTags")}</label>
                                <CreatableSelect
                                    isMulti options={allTags} value={selectedTags} onChange={setSelectedTags}
                                    placeholder={t("settings.tagsPlaceholder")}
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'var(--bs-border-color)' }),
                                        menu: (base) => ({ ...base, backgroundColor: 'var(--bs-body-bg)', zIndex: 9999 }),
                                        multiValue: (base) => ({ ...base, backgroundColor: 'var(--bs-secondary-bg)' }),
                                        multiValueLabel: (base) => ({ ...base, color: 'var(--bs-body-color)' })
                                    }}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text)', opacity: 0.8 }}>{t("settings.labelImage")}</label>
                                <input className="form-control form-control-sm mb-2 border-secondary-subtle" style={{ color: 'var(--text)', opacity: 0.8 }} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
                                <div className="border rounded d-flex align-items-center justify-content-center" style={{ height: "100px", overflow: "hidden", backgroundColor: 'var(--bs-secondary-bg)', borderStyle: 'dashed' }}>
                                    {imageUrl ? <img src={imageUrl} alt="Preview" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: 'contain' }} /> : <i className="text-muted small">{t("settings.noImage")}</i>}
                                </div>
                            </div>
                            <div className="form-check form-switch mt-4">
                                <input className="form-check-input" type="checkbox" id="publicSwitch" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                                <label className="form-check-label fw-bold small" htmlFor="publicSwitch" style={{ color: 'var(--text)', opacity: 0.8, letterSpacing: '0.5px' }}>{t("settings.labelPublic")}</label>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4 opacity-25" />
                    <button className="btn btn-success w-100 py-2 fw-bold shadow-sm" onClick={() => handleSaveSettings()} disabled={isSaving}>
                        {isSaving ? t("settings.savingBtn") : t("settings.saveBtn")}
                    </button>
                </div>
            </div>

            <div className="card mb-4 shadow-sm border-0 overflow-hidden">
                <div className="card-header py-3"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: 'none' }}>
                    <span className="fw-bold text-uppercase small" style={{ letterSpacing: '1px', color: 'var(--text)', opacity: 0.8 }}>
                        {t("settings.sectionId")}
                    </span>
                </div>
                <div className="card-body">
                    <CustomIdConstructor
                        initialTemplate={inventory.customIdTemplate}
                        template={template}
                        setTemplate={setTemplate}
                        onSave={(tpl) => handleSaveSettings(tpl)}
                        lastSequenceNumber={inventory.lastSequenceNumber}
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6 d-flex">
                    <div className="card shadow-sm border-0 w-100 overflow-hidden" style={{ backgroundColor: 'var(--bs-card-bg)' }}>
                        <div className="card-header py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: 'none' }}>
                            <span className="fw-bold text-uppercase small" style={{ color: 'var(--text)', opacity: 0.8, letterSpacing: '0.5px' }}>{t("settings.sectionAccess")}</span>
                        </div>
                        <div className="card-body p-0">
                            <div className="p-3 border-secondary-subtle">
                                <div className="input-group input-group-sm">
                                    <input className="form-control bg-transparent" style={{ color: 'var(--text)' }} placeholder="user@email.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                                    <button className="btn btn-primary" onClick={async () => {
                                        setIsAddingAccess(true);
                                        try { await api.post(`/inventories/${inventory.id}`, { email: newUserEmail }); setNewUserEmail(""); loadData(); }
                                        catch { toast.error("User not found"); } finally { setIsAddingAccess(false); }
                                    }} disabled={isAddingAccess}>{isAddingAccess ? "..." : "+"}</button>
                                </div>
                            </div>
                            <ul className="list-group list-group-flush">
                                <span className="badge bg-secondary">
                                    Debug: {accessList.length}
                                </span>
                                {isPublic && (
                                    <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3 border-0 border-bottom border-secondary-subtle">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-globe2 me-2 text-info"></i>
                                            <div>
                                                <span className="fw-bold text-info">{t("settings.publicAccessTitle")}</span>
                                                <div className="small text-muted">{t("settings.publicAccessDesc")}</div>
                                            </div>
                                        </div>
                                    </li>
                                )}
                                {accessList.length === 0 && !isPublic ? (
                                    <li className="list-group-item text-center py-5 bg-transparent border-0" style={{ color: 'var(--text)', opacity: 0.5 }}>
                                        {t("settings.privateNotice")}
                                    </li>
                                ) : (
                                    accessList.map(u => (
                                        <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3 border-0">
                                            <span className="fw-medium" style={{ color: 'var(--text)' }}>
                                                {u.userName || u.email || "Unknown User"}
                                            </span>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 rounded-pill">
                                                {u.role || (u.canWrite ? t("roles.editor") : t("roles.viewer"))}
                                            </span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 d-flex">
                    <div className="card shadow-sm border-0 w-100 overflow-hidden" style={{ backgroundColor: 'var(--bs-card-bg)' }}>
                        <div className="card-header py-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: 'none' }}>
                            <span className="fw-bold text-uppercase small" style={{ color: 'var(--text)', opacity: 0.8, letterSpacing: '0.5px' }}>{t("settings.sectionStats")}</span>
                        </div>
                        <div className="card-body">
                            {stats ? (
                                <div style={{ color: 'var(--text)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3"><i className="bi bi-box-seam text-primary"></i></div>
                                            <span className="text-uppercase small opacity-75 fw-semibold">{t("settings.statTotal")}</span>
                                        </div>
                                        <span className="h4 mb-0 fw-bold">{stats.count}</span>
                                    </div>

                                    <hr className="opacity-10" />

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-danger bg-opacity-10 p-2 me-3"><i className="bi bi-heart-fill text-danger"></i></div>
                                            <span className="text-uppercase small opacity-75 fw-semibold">Avg Likes</span>
                                        </div>
                                        <span className="h5 mb-0 fw-bold">{stats.likesAvg}</span>
                                    </div>

                                    <hr className="opacity-10" />

                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center overflow-hidden">
                                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3"><i className="bi bi-fire text-warning"></i></div>
                                            <span className="text-uppercase small opacity-75 fw-semibold">Most Popular</span>
                                        </div>
                                        <span className="fw-bold text-truncate ms-3" style={{ maxWidth: '120px' }} title={stats.mostPopular}>{stats.mostPopular}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 small text-uppercase opacity-50">{t("settings.noStats")}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}