import { useEffect, useState, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import CreatableSelect from "react-select/creatable";
import api from "../../api/api";
import CustomIdConstructor from "../CustomIdConstructor";
import { useTranslation } from "react-i18next";

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

    const versionRef = useRef(inventory.version || "");
    const currentDataRef = useRef({});

    const categories = [
        { value: "General", label: t("categories.general") },
        { value: "Office", label: t("categories.office") },
        { value: "Library", label: t("categories.library") },
        { value: "Facilities", label: t("categories.facilities") },
        { value: "Archive", label: t("categories.archive") }
    ];

    currentDataRef.current = { title, description, isPublic, category, imageUrl, selectedTags, template };

    useEffect(() => {
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
        const loadInitialData = async () => {
            try {
                const [accessRes, itemsRes, tagsRes] = await Promise.all([
                    api.get(`/inventories/${inventory.id}/access`),
                    api.get(`/items/inventories/${inventory.id}/items`),
                    api.get("/inventories/tags")
                ]);

                setAccessList(accessRes.data);

                if (tagsRes.data) {
                    const formattedTags = tagsRes.data.map(tagName => ({
                        value: tagName,
                        label: tagName
                    }));
                    setAllTags(formattedTags);
                }

                if (itemsRes.data.length > 0) {
                    const count = itemsRes.data.length;
                    const nameLengths = itemsRes.data.map(i => i.name?.length || 0);
                    const descLengths = itemsRes.data.map(i => i.description?.length || 0);
                    setStats({
                        count,
                        nameAvg: (nameLengths.reduce((a, b) => a + b, 0) / count).toFixed(1),
                        descAvg: (descLengths.reduce((a, b) => a + b, 0) / count).toFixed(1),
                        nameRange: `${Math.min(...nameLengths)} - ${Math.max(...nameLengths)}`,
                        descRange: `${Math.min(...descLengths)} - ${Math.max(...descLengths)}`
                    });
                }
            } catch (err) { console.error("Initialization failed", err); }
        };
        loadInitialData();
    }, [inventory.id]);

    useEffect(() => {
        if (inventory.version) {
            versionRef.current = inventory.version;
        }
    }, [inventory.version]);

    const handleTagsChange = (newValue) => {
        const updatedTags = newValue || [];
        setSelectedTags(updatedTags);
        currentDataRef.current.selectedTags = updatedTags;
        setIsDirty(true);
    };

    const handleSaveSettings = useCallback(async (isAuto = false) => {
        if (isAuto && !isDirty) return;
        if (isSaving) return;

        if (!versionRef.current) {
            console.error("CRITICAL: versionRef.current is missing!");
            return;
        }

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
                    onUpdate({
                        ...inventory,
                        ...payload,
                        tags: data.selectedTags.map(t => ({ name: t.value })),
                        version: response.data.version
                    });
                }
            }

            setIsDirty(false);
            setLastSaved(new Date().toLocaleTimeString());
        } catch (err) {
            if (err.response?.status === 409) {
                if (!isAuto) alert(t("settings.conflictError"));
            }
            console.error("Save failed", err);
        } finally {
            setIsSaving(false);
        }
    }, [inventory, isDirty, isSaving, onUpdate, t]);

    useEffect(() => {
        const timer = setInterval(() => {
            handleSaveSettings(true);
        }, 8000);
        return () => clearInterval(timer);
    }, [handleSaveSettings]);

    return (
        <div className="container-fluid pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">{t("settings.title")}</h4>
                <div className="small">
                    {isDirty ? (
                        <span className="badge bg-warning text-dark shadow-sm animate-pulse px-3">
                            {t("settings.unsaved")}
                        </span>
                    ) : (
                        lastSaved && <span className="text-success fw-bold">✓ {t("settings.savedAt", { time: lastSaved })}</span>
                    )}
                </div>
            </div>

            <div className="card mb-4 shadow-sm border-0 overflow-hidden">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                    <span className="fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>{t("settings.sectionGeneral")}</span>
                    {isSaving && <div className="spinner-border spinner-border-sm text-light"></div>}
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-7">
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase opacity-75">{t("settings.labelTitle")}</label>
                                <input
                                    className="form-control border-secondary-subtle"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label fw-bold small text-uppercase opacity-75 mb-0">{t("settings.labelDesc")}</label>
                                    <button
                                        className="btn btn-sm btn-link text-decoration-none p-0"
                                        onClick={() => setPreviewMarkdown(!previewMarkdown)}
                                    >
                                        {previewMarkdown ? t("settings.modeEdit") : t("settings.modePreview")}
                                    </button>
                                </div>
                                {previewMarkdown ? (
                                    <div className="p-3 border rounded shadow-inner" style={{ minHeight: "124px", backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                        <ReactMarkdown>{description || t("settings.noDesc")}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <textarea
                                        className="form-control border-secondary-subtle"
                                        rows="4"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase opacity-75">{t("settings.labelCategory")}</label>
                                <select className="form-select border-secondary-subtle" value={category} onChange={e => setCategory(e.target.value)}>
                                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase opacity-75">{t("settings.labelTags")}</label>
                                <CreatableSelect
                                    isMulti
                                    options={allTags}
                                    value={selectedTags}
                                    onChange={handleTagsChange}
                                    placeholder={t("settings.tagsPlaceholder")}
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            backgroundColor: 'transparent',
                                            borderColor: 'var(--bs-border-color)',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: 'var(--bs-body-bg)',
                                            zIndex: 9999
                                        }),
                                        multiValue: (base) => ({
                                            ...base,
                                            backgroundColor: 'var(--bs-secondary-bg)',
                                        }),
                                        multiValueLabel: (base) => ({
                                            ...base,
                                            color: 'var(--bs-body-color)',
                                        })
                                    }}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold small text-uppercase opacity-75">Image Preview</label>
                                <div className="input-group input-group-sm mb-2">
                                    <input
                                        className="form-control border-secondary-subtle"
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="border rounded d-flex align-items-center justify-content-center"
                                    style={{ height: "100px", overflow: "hidden", backgroundColor: 'var(--bs-secondary-bg)', borderStyle: 'dashed' }}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Preview" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: 'contain' }} />
                                    ) : (
                                        <i className="text-muted small">No Image Provided</i>
                                    )}
                                </div>
                            </div>

                            <div className="form-check form-switch mb-3 mt-4">
                                <input className="form-check-input" type="checkbox" id="publicSwitch" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                                <label className="form-check-label fw-bold small" htmlFor="publicSwitch">{t("settings.labelPublic")}</label>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4 opacity-25" />
                    <button className="btn btn-success px-5 py-2 fw-bold shadow-sm" onClick={() => handleSaveSettings()} disabled={isSaving}>
                        {isSaving ? t("settings.savingBtn") : t("settings.saveBtn")}
                    </button>
                </div>
            </div>

            <div className="card mb-4 shadow-sm border-0 overflow-hidden">
                <div className="card-header bg-primary text-white py-3">
                    <span className="fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>{t("settings.sectionId")}</span>
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
                    <div className="card shadow-sm border-0 w-100 overflow-hidden">
                        <div className="card-header bg-light-subtle fw-bold small text-uppercase opacity-75 py-3">
                            {t("settings.sectionAccess")}
                        </div>
                        <ul className="list-group list-group-flush">
                            {accessList.length === 0 ? (
                                <li className="list-group-item text-muted small text-center py-5 bg-transparent">
                                    {t("settings.privateNotice")}
                                </li>
                            ) : (
                                accessList.map(u => (
                                    <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3">
                                        <span className="fw-medium">{u.userName}</span>
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 rounded-pill">
                                            {u.role}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

                <div className="col-md-6 d-flex">
                    <div className="card shadow-sm border-0 w-100 overflow-hidden">
                        <div className="card-header bg-light-subtle fw-bold small text-uppercase opacity-75 py-3">
                            {t("settings.sectionStats")}
                        </div>
                        <div className="card-body d-flex align-items-center">
                            {stats ? (
                                <div className="row text-center w-100 g-0">
                                    <div className="col-4 border-end">
                                        <div className="display-6 fw-bold mb-0">{stats.count}</div>
                                        <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>{t("settings.statTotal")}</small>
                                    </div>
                                    <div className="col-8 text-start ps-4 d-flex flex-column justify-content-center">
                                        <div className="mb-2">
                                            <span className="text-muted small text-uppercase">{t("settings.statNameAvg")}:</span>
                                            <strong className="ms-2">{stats.nameAvg} ch.</strong>
                                        </div>
                                        <div>
                                            <span className="text-muted small text-uppercase">{t("settings.statDescAvg")}:</span>
                                            <strong className="ms-2">{stats.descAvg} ch.</strong>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center w-100 py-4 text-muted">
                                    <p className="small mb-0 italic text-uppercase">{t("settings.noStats")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}