import React, { useEffect, useMemo, useState } from 'react';
import {
    HiOutlineExternalLink,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineLink,
    HiChevronDown,
    HiOutlineDocumentText,
    HiOutlinePaperClip,
    HiOutlinePencil
} from 'react-icons/hi';
import { useAppContext } from '../../context/AppContext';

const FILE_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUBJECT_OPTIONS = [
    'Computer Science',
    'Mathematics',
    'Science',
    'Literature',
    'History',
    'Business',
    'Psychology',
    'Other'
];

const ResourceLinks = ({
    title = 'Resource Links',
    description = 'Save links or files and tie them to a note for quick recall.',
    kicker = 'Study vault',
    defaultNoteId = null,
    defaultNoteTitle = '',
    filterNoteId = null,
    emptyMessage = 'No resources yet.'
}) => {
    const { notes } = useAppContext();
    const [links, setLinks] = useState(() => {
        const saved = localStorage.getItem('studyBuddyResources');
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.warn('Failed to parse saved resources. Resetting.', error);
            return [];
        }
    });
    const [newResource, setNewResource] = useState({
        title: '',
        url: '',
        subject: '',
        noteId: defaultNoteId ? String(defaultNoteId) : ''
    });
    const [customSubject, setCustomSubject] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [formError, setFormError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState(null);
    const [editCustomSubject, setEditCustomSubject] = useState('');
    const [editFileData, setEditFileData] = useState(null);
    const [editError, setEditError] = useState('');

    const noteLookup = useMemo(() => {
        return new Map(notes.map((note) => [note.id, note.title]));
    }, [notes]);

    useEffect(() => {
        setNewResource((prev) => ({
            ...prev,
            noteId: defaultNoteId ? String(defaultNoteId) : prev.noteId
        }));
    }, [defaultNoteId]);

    const saveLinks = (updatedLinks) => {
        setLinks(updatedLinks);
        localStorage.setItem('studyBuddyResources', JSON.stringify(updatedLinks));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setFileData(null);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFormError('File too large. Please upload files under 5MB.');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setFileData({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: reader.result
            });
        };
        reader.readAsDataURL(file);
        setFormError('');
    };

    const handleAddLink = (e) => {
        if (e?.preventDefault) e.preventDefault();
        setFormError('');
        const titleValue = newResource.title.trim();
        const urlValue = newResource.url.trim();
        const finalSubject = newResource.subject === 'Other' ? customSubject.trim() : newResource.subject;
        const noteId = newResource.noteId ? Number(newResource.noteId) : null;
        const noteTitle = noteId
            ? noteLookup.get(noteId) || defaultNoteTitle || 'Unlinked'
            : defaultNoteTitle || 'Unlinked';

        if (!titleValue || !finalSubject) {
            setFormError('Title and subject are required.');
            return;
        }
        if (!urlValue && !fileData) {
            setFormError('Add a URL or upload a file.');
            return;
        }

        const newItem = {
            id: Date.now(),
            title: titleValue,
            url: urlValue,
            subject: finalSubject,
            noteId,
            noteTitle,
            fileName: fileData?.name || null,
            fileType: fileData?.type || null,
            fileSize: fileData?.size || null,
            fileDataUrl: fileData?.dataUrl || null,
            createdAt: new Date().toISOString()
        };

        saveLinks([newItem, ...links]);
        setNewResource({
            title: '',
            url: '',
            subject: '',
            noteId: defaultNoteId ? String(defaultNoteId) : ''
        });
        setCustomSubject('');
        setFileData(null);
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        saveLinks(links.filter((link) => link.id !== id));
    };

    const startEdit = (link) => {
        const isKnownSubject = SUBJECT_OPTIONS.includes(link.subject) && link.subject !== 'Other';
        setEditingId(link.id);
        setEditDraft({
            ...link,
            subject: isKnownSubject ? link.subject : 'Other',
            noteId: link.noteId ? String(link.noteId) : ''
        });
        setEditCustomSubject(isKnownSubject ? '' : link.subject || '');
        setEditFileData(null);
        setEditError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditDraft(null);
        setEditCustomSubject('');
        setEditFileData(null);
        setEditError('');
    };

    const handleEditFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setEditFileData(null);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setEditError('File too large. Please upload files under 5MB.');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setEditFileData({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: reader.result
            });
        };
        reader.readAsDataURL(file);
        setEditError('');
    };

    const saveEdit = () => {
        if (!editDraft) return;
        const titleValue = editDraft.title?.trim();
        const urlValue = editDraft.url?.trim();
        const finalSubject = editDraft.subject === 'Other' ? editCustomSubject.trim() : editDraft.subject;
        const noteId = editDraft.noteId ? Number(editDraft.noteId) : null;
        const noteTitle = noteId
            ? noteLookup.get(noteId) || editDraft.noteTitle || defaultNoteTitle || 'Unlinked'
            : editDraft.noteTitle || defaultNoteTitle || 'Unlinked';

        if (!titleValue || !finalSubject) {
            setEditError('Title and subject are required.');
            return;
        }

        const hasExistingFile = !!editDraft.fileDataUrl;
        const hasFile = !!editFileData || hasExistingFile;
        if (!urlValue && !hasFile) {
            setEditError('Add a URL or upload a file.');
            return;
        }

        const updatedLinks = links.map((link) => {
            if (link.id !== editingId) return link;
            return {
                ...link,
                title: titleValue,
                url: urlValue,
                subject: finalSubject,
                noteId,
                noteTitle,
                fileName: editFileData?.name || link.fileName || null,
                fileType: editFileData?.type || link.fileType || null,
                fileSize: editFileData?.size || link.fileSize || null,
                fileDataUrl: editFileData?.dataUrl || link.fileDataUrl || null
            };
        });
        saveLinks(updatedLinks);
        cancelEdit();
    };

    const normalizedFilterId = filterNoteId ? Number(filterNoteId) : null;
    const visibleLinks = normalizedFilterId
        ? links.filter((link) => {
            const linkNoteId = typeof link.noteId === 'string' ? Number(link.noteId) : link.noteId;
            return linkNoteId === normalizedFilterId;
        })
        : links;

    return (
        <div className="sb-card h-[400px] flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-200">
                        <HiOutlineLink />
                    </div>
                    <div>
                        <p className="sb-kicker">{kicker}</p>
                        <h3 className="font-display text-lg text-white">{title}</h3>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className="sb-btn sb-btn-subtle text-xs"
                >
                    <HiOutlinePlus /> {isAdding ? 'Close' : 'Add'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 sb-scroll space-y-5">
                {description && <p className="text-slate-400 text-sm">{description}</p>}

                {isAdding && (
                    <div className="space-y-3 sb-card-soft">
                        <input
                            placeholder="Resource Title"
                            value={newResource.title}
                            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                            required
                            className="sb-input"
                        />
                        <input
                            placeholder="Optional URL (https://...)"
                            value={newResource.url}
                            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                            className="sb-input"
                        />

                        <div className="relative">
                            <select
                                value={newResource.subject}
                                onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                                className="sb-select"
                                required
                            >
                                <option value="">Select Subject</option>
                                {SUBJECT_OPTIONS.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                            <HiChevronDown className="sb-select-icon" />
                        </div>

                        {newResource.subject === 'Other' && (
                            <input
                                placeholder="Custom Subject"
                                value={customSubject}
                                onChange={(e) => setCustomSubject(e.target.value)}
                                required
                                className="sb-input"
                            />
                        )}

                        <div className="relative">
                            <select
                                value={newResource.noteId}
                                onChange={(e) => setNewResource({ ...newResource, noteId: e.target.value })}
                                className="sb-select"
                            >
                                <option value="">Link to note (optional)</option>
                                {notes.map((note) => (
                                    <option key={note.id} value={note.id}>
                                        {note.title}
                                    </option>
                                ))}
                            </select>
                            <HiChevronDown className="sb-select-icon" />
                        </div>

                        <div className="sb-card-soft flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-300">
                                <HiOutlinePaperClip />
                                <span>{fileData ? fileData.name : 'Upload file (pdf, docx, jpg...)'}</span>
                            </div>
                            <label className="sb-btn sb-btn-ghost text-xs cursor-pointer">
                                Browse
                                <input
                                    type="file"
                                    accept={FILE_ACCEPT}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {formError && (
                            <div className="text-amber-300 text-xs">{formError}</div>
                        )}

                        <button type="button" onClick={handleAddLink} className="sb-btn sb-btn-primary w-full">
                            Save Resource
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    {visibleLinks.map((link) => {
                        const resolvedNoteId = typeof link.noteId === 'string' ? Number(link.noteId) : link.noteId;
                        const noteTitle = resolvedNoteId
                            ? noteLookup.get(resolvedNoteId) || link.noteTitle || 'Unlinked'
                            : link.noteTitle || 'Unlinked';
                        const isEditing = editingId === link.id;
                        return (
                            <div key={link.id} className="sb-card-soft space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-slate-100 text-sm font-semibold truncate">{link.title}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="sb-tag">{link.subject}</span>
                                            <span className="sb-tag">Note: {noteTitle}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(link)}
                                            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                            title="Edit"
                                        >
                                            <HiOutlinePencil />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                            title="Delete"
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    </div>
                                </div>

                                {isEditing && editDraft ? (
                                    <div className="space-y-3">
                                        <input
                                            value={editDraft.title || ''}
                                            onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                                            className="sb-input"
                                            placeholder="Resource title"
                                        />
                                        <input
                                            value={editDraft.url || ''}
                                            onChange={(e) => setEditDraft({ ...editDraft, url: e.target.value })}
                                            className="sb-input"
                                            placeholder="Optional URL"
                                        />
                                        <div className="relative">
                                            <select
                                                value={editDraft.subject || ''}
                                                onChange={(e) => setEditDraft({ ...editDraft, subject: e.target.value })}
                                                className="sb-select"
                                            >
                                                <option value="">Select Subject</option>
                                                {SUBJECT_OPTIONS.map((subject) => (
                                                    <option key={subject} value={subject}>
                                                        {subject}
                                                    </option>
                                                ))}
                                            </select>
                                            <HiChevronDown className="sb-select-icon" />
                                        </div>
                                        {editDraft.subject === 'Other' && (
                                            <input
                                                value={editCustomSubject}
                                                onChange={(e) => setEditCustomSubject(e.target.value)}
                                                className="sb-input"
                                                placeholder="Custom subject"
                                            />
                                        )}
                                        <div className="relative">
                                            <select
                                                value={editDraft.noteId || ''}
                                                onChange={(e) => setEditDraft({ ...editDraft, noteId: e.target.value })}
                                                className="sb-select"
                                            >
                                                <option value="">Link to note (optional)</option>
                                                {notes.map((note) => (
                                                    <option key={note.id} value={note.id}>
                                                        {note.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <HiChevronDown className="sb-select-icon" />
                                        </div>
                                        <div className="sb-card-soft flex items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <HiOutlinePaperClip />
                                                <span>{editFileData ? editFileData.name : 'Replace file (optional)'}</span>
                                            </div>
                                            <label className="sb-btn sb-btn-ghost text-xs cursor-pointer">
                                                Browse
                                                <input
                                                    type="file"
                                                    accept={FILE_ACCEPT}
                                                    className="hidden"
                                                    onChange={handleEditFileChange}
                                                />
                                            </label>
                                        </div>
                                        {editError && (
                                            <div className="text-amber-300 text-xs">{editError}</div>
                                        )}
                                        <div className="flex gap-3">
                                            <button type="button" onClick={saveEdit} className="sb-btn sb-btn-primary text-xs">
                                                Save
                                            </button>
                                            <button type="button" onClick={cancelEdit} className="sb-btn sb-btn-ghost text-xs">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        {link.url && (
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-emerald-200 hover:text-emerald-100"
                                            >
                                                <HiOutlineExternalLink /> Open link
                                            </a>
                                        )}
                                        {link.fileDataUrl && (
                                            <a
                                                href={link.fileDataUrl}
                                                download={link.fileName || 'resource'}
                                                className="inline-flex items-center gap-2 text-sky-200 hover:text-sky-100"
                                            >
                                                <HiOutlineDocumentText /> {link.fileName || 'Download file'}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {visibleLinks.length === 0 && !isAdding && (
                        <div className="text-center text-sm text-slate-500 py-4">{emptyMessage}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceLinks;
