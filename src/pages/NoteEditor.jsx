import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { generateQuizFromNote, generateNoteTable, summarizeNote, rewriteNote } from '../services/gemini';
import { renderMarkdown } from '../utils/helpers';
import { HiOutlineArrowLeft, HiOutlineSparkles, HiOutlineTable, HiOutlineSave, HiOutlinePencilAlt, HiSparkles, HiChevronDown, HiOutlineCheck, HiOutlinePaperClip, HiOutlineShare, HiOutlinePrinter, HiOutlinePhotograph, HiOutlineLink, HiOutlineMicrophone, HiOutlineDownload, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import ResourceLinks from '../components/Tools/ResourceLinks';
import jsPDF from 'jspdf';

const SUBJECT_OPTIONS = ['Computer Science', 'Mathematics', 'Science', 'Literature', 'History', 'Psychology', 'Business', 'Other'];
const REWRITE_STYLES = [
    'Academic',
    'Casual',
    'Concise',
    'Professional',
    'Friendly',
    'Simple',
    'Bullet Points',
    'Storytelling'
];

class QuillErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error('Quill render failed:', error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

const FONT_WHITELIST = ['poppins', 'jakarta', 'grotesk', 'jetbrains', 'merriweather', 'monaco'];
const DEFAULT_FONT = 'poppins';
const DEFAULT_SIZE = 12;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 120;

if (typeof window !== 'undefined') {
    try {
        const QuillRef = ReactQuill?.Quill;
        if (QuillRef?.import) {
            const Size = QuillRef.import('attributors/style/size');
            if (Size) {
                Size.whitelist = null;
                QuillRef.register(Size, true);
            }
            const Font = QuillRef.import('formats/font');
            if (Font) {
                Font.whitelist = FONT_WHITELIST;
                QuillRef.register(Font, true);
            }
        }
    } catch (error) {
        console.warn('Quill setup failed:', error);
    }
}

const NoteEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notes, addNote, updateNote } = useAppContext();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            content: '',
            subject: '',
            customSubject: '',
        },
    });

    const selectedSubject = watch('subject');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [loadedId, setLoadedId] = useState(null);
    const [rewriteStyle, setRewriteStyle] = useState('Academic');
    const [showRewriteOptions, setShowRewriteOptions] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    const [showSubjectMenu, setShowSubjectMenu] = useState(false);
    const [showRewriteMenu, setShowRewriteMenu] = useState(false);
    const [pendingAttachType, setPendingAttachType] = useState(null);
    const [customSize, setCustomSize] = useState('12');
    const [currentFont, setCurrentFont] = useState(DEFAULT_FONT);
    const [isEditorLight, setIsEditorLight] = useState(false);
    const [showMobileTools, setShowMobileTools] = useState(false);
    const [showMobileShare, setShowMobileShare] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const quillRef = useRef(null);
    const attachMenuRef = useRef(null);
    const styleMenuRef = useRef(null);
    const subjectMenuRef = useRef(null);
    const rewriteMenuRef = useRef(null);
    const mobileToolsRef = useRef(null);
    const mobileShareRef = useRef(null);
    const fileInputRef = useRef(null);
    const shareLockRef = useRef(false);
    const contentValue = watch('content');
    const wordCount = useMemo(() => {
        if (typeof document === 'undefined') return 0;
        const temp = document.createElement('div');
        temp.innerHTML = contentValue || '';
        const text = (temp.textContent || temp.innerText || '').trim();
        if (!text) return 0;
        return text.split(/\s+/).filter(Boolean).length;
    }, [contentValue]);
    useEffect(() => {
        if (!id) {
            reset({
                title: '',
                content: '',
                subject: '',
                customSubject: '',
            });
            setCustomSize(String(DEFAULT_SIZE));
            setCurrentFont(DEFAULT_FONT);
            setLoadedId(null);
            return;
        }
        const noteToEdit = notes.find((note) => note.id === Number(id));
        if (!noteToEdit) {
            navigate('/dashboard');
            return;
        }
        if (loadedId === Number(id)) return;
        setValue('title', noteToEdit.title);
        setValue('subject', noteToEdit.subject);
        setValue('content', noteToEdit.content);
        if (!SUBJECT_OPTIONS.includes(noteToEdit.subject)) {
            setValue('subject', 'Other');
            setValue('customSubject', noteToEdit.subject);
        }
        setLoadedId(Number(id));
    }, [id, notes, navigate, setValue, loadedId, reset]);

    useEffect(() => {
        const editor = quillRef.current?.getEditor?.();
        if (!editor) return;
        if (editor.getLength() <= 1) {
            editor.format('font', DEFAULT_FONT, 'silent');
            editor.format('size', `${DEFAULT_SIZE}px`, 'silent');
        }
    }, []);

    const sanitizeDelta = (delta) => {
        if (!delta?.ops) return delta;
        delta.ops = delta.ops.map((op) => {
            if (!op.attributes) return op;
            const attrs = { ...op.attributes };
            if (attrs.font && !FONT_WHITELIST.includes(attrs.font)) {
                delete attrs.font;
            }
            if (attrs.size) {
                let parsed = null;
                if (typeof attrs.size === 'string') {
                    const match = attrs.size.match(/(\d+)/);
                    if (match) parsed = Number.parseInt(match[1], 10);
                } else if (typeof attrs.size === 'number') {
                    parsed = attrs.size;
                }
                if (!parsed || parsed < MIN_FONT_SIZE || parsed > MAX_FONT_SIZE) {
                    delete attrs.size;
                } else {
                    attrs.size = `${parsed}px`;
                }
            }
            if (Object.keys(attrs).length === 0) {
                delete op.attributes;
                return op;
            }
            return { ...op, attributes: attrs };
        });
        return delta;
    };

    const modules = useMemo(() => {
        const matchers = [];
        if (typeof Node !== 'undefined') {
            matchers.push([Node.ELEMENT_NODE, (node, delta) => sanitizeDelta(delta)]);
        }
        return {
            toolbar: {
                container: '#note-toolbar'
            },
            clipboard: {
                matchVisual: false,
                matchers
            }
        };
    }, []);

    const formats = useMemo(() => {
        return [
            'bold',
            'italic',
            'underline',
            'strike',
            'list',
            'bullet',
            'blockquote',
            'code-block',
            'link',
            'align',
            'font',
            'size',
            'color',
            'background',
            'image',
            'table'
        ];
    }, []);

    const clampSize = (value) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value));

    const parseSizeValue = (size) => {
        if (!size) return DEFAULT_SIZE;
        if (typeof size === 'string') {
            const match = size.match(/(\d+)/);
            if (match) return Number.parseInt(match[1], 10);
        }
        if (typeof size === 'number') return size;
        return DEFAULT_SIZE;
    };

    const applyCustomSize = (nextValue = customSize) => {
        const value = String(nextValue).trim();
        if (!value) return;
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) return;
        const clamped = clampSize(parsed);
        const editor = quillRef.current?.getEditor?.();
        setCustomSize(String(clamped));
        if (editor) {
            editor.format('size', `${clamped}px`, 'user');
        }
    };

    const applyFont = (fontValue) => {
        const nextFont = FONT_WHITELIST.includes(fontValue) ? fontValue : DEFAULT_FONT;
        setCurrentFont(nextFont);
        const editor = quillRef.current?.getEditor?.();
        if (editor) {
            editor.format('font', nextFont, 'user');
        }
    };

    const getEditor = () => quillRef.current?.getEditor?.();

    const insertCheckbox = () => {
        const editor = getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();
        editor.insertText(index, '☐ ', 'user');
        editor.setSelection(index + 2, 0, 'silent');
    };

    const buildTableHtml = (tableId, rows = 2, cols = 2) => {
        const rowHtml = Array.from({ length: rows })
            .map(() => `<tr>${'<td><br/></td>'.repeat(cols)}</tr>`)
            .join('');
        return `
            <div class="sb-table-wrap" data-table-id="${tableId}">
                <table data-table-id="${tableId}">
                    <tbody>${rowHtml}</tbody>
                </table>
                <div class="sb-table-controls" data-table-id="${tableId}" contenteditable="false">
                    <button type="button" class="sb-table-control-btn" data-sb-table-action="add-row" data-table-id="${tableId}">Row +</button>
                    <button type="button" class="sb-table-control-btn" data-sb-table-action="add-col" data-table-id="${tableId}">Col +</button>
                </div>
            </div>
            <p><br/></p>
        `;
    };

    const insertTable = () => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        // Insert a simple visual separator and a placeholder for table
        // Since rich tables are proving unstable, we provide a clean template
        const tableTemplate = `\n
[TABLE START]
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
[TABLE END]\n`;
        editor.insertText(range.index, tableTemplate, 'user');
        editor.setSelection(range.index + tableTemplate.length, 0);
    };

    const handleAttachAction = (type) => {
        setShowAttachMenu(false);
        if (type === 'url') {
            const url = window.prompt('Enter the URL');
            if (!url) return;
            const label = window.prompt('Link text (optional)') || url;
            const editor = getEditor();
            if (!editor) return;
            const range = editor.getSelection(true);
            const index = range ? range.index : editor.getLength();
            editor.insertText(index, label, { link: url }, 'user');
            editor.setSelection(index + label.length, 0, 'silent');
            return;
        }
        setPendingAttachType(type);
        const input = fileInputRef.current;
        if (!input) return;
        if (type === 'image') input.accept = 'image/*';
        if (type === 'voice') input.accept = 'audio/*';
        if (type === 'pdf') input.accept = 'application/pdf';
        input.value = '';
        input.click();
    };

    const handleFileInsert = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setPendingAttachType(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const editor = getEditor();
            if (!editor) return;
            const range = editor.getSelection(true);
            const index = range ? range.index : editor.getLength();
            const dataUrl = reader.result;
            if (pendingAttachType === 'image') {
                editor.insertEmbed(index, 'image', dataUrl, 'user');
                editor.setSelection(index + 1, 0, 'silent');
            } else {
                const label = pendingAttachType === 'voice' ? `Audio: ${file.name}` : `PDF: ${file.name}`;
                editor.insertText(index, label, { link: dataUrl }, 'user');
                editor.insertText(index + label.length, '\n', 'user');
                editor.setSelection(index + label.length + 1, 0, 'silent');
            }
            setPendingAttachType(null);
        };
        reader.readAsDataURL(file);
    };

    const sanitizeFilename = (value) => value.replace(/[^a-z0-9-_]+/gi, '_');

    const buildExportElement = () => {
        const title = getValues('title') || 'StudyBuddy Note';
        const rawContent = getValues('content') || '';
        const wrapper = document.createElement('div');
        wrapper.className = 'sb-editor sb-export-root';
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-10000px';
        wrapper.style.top = '0';
        wrapper.style.opacity = '1';
        wrapper.style.pointerEvents = 'none';
        wrapper.style.zIndex = '-1';
        wrapper.style.width = '794px';
        wrapper.style.padding = '32px';
        wrapper.style.background = '#ffffff';
        wrapper.style.color = '#0f1720';
        wrapper.style.fontFamily = '"Poppins", Arial, sans-serif';

        const heading = document.createElement('h1');
        heading.textContent = title;
        heading.style.fontSize = '20px';
        heading.style.marginBottom = '16px';

        const content = document.createElement('div');
        content.className = 'ql-editor sb-export-editor';
        content.innerHTML = rawContent || '<p></p>';
        content.querySelectorAll('.sb-table-controls').forEach((node) => node.remove());

        wrapper.appendChild(heading);
        wrapper.appendChild(content);
        document.body.appendChild(wrapper);

        return {
            element: wrapper,
            title,
            cleanup: () => wrapper.remove()
        };
    };

    const renderPdfWithStyles = async () => {
        const { element, title, cleanup } = buildExportElement();
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        if (document.fonts?.ready) {
            try {
                await document.fonts.ready;
            } catch (error) {
                console.warn('Font readiness check failed.', error);
            }
        }
        await new Promise((resolve) => {
            doc.html(element, {
                x: 32,
                y: 32,
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                },
                autoPaging: 'text',
                windowWidth: element.scrollWidth,
                callback: () => resolve()
            });
        });
        cleanup();
        return { doc, title };
    };

    const handleSharePdf = async () => {
        if (shareLockRef.current) return;
        shareLockRef.current = true;
        try {
            const { doc, title } = await renderPdfWithStyles();
            const safeName = sanitizeFilename(title || 'studybuddy-note');
            const pdfBlob = doc.output('blob');
            const file = new File([pdfBlob], `${safeName}.pdf`, { type: 'application/pdf' });
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title,
                    text: 'StudyBuddy note'
                });
                shareLockRef.current = false;
                return;
            }
            alert('Sharing is not supported in this browser. Use Download instead.');
        } catch (error) {
            console.warn('Share cancelled or failed.', error);
        } finally {
            shareLockRef.current = false;
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const { doc, title } = await renderPdfWithStyles();
            const safeName = sanitizeFilename(title || 'studybuddy-note');
            doc.save(`${safeName}.pdf`);
        } catch (error) {
            console.warn('PDF download failed.', error);
        }
    };

    const handlePrintNote = () => {
        const title = getValues('title') || 'StudyBuddy Note';
        const rawContent = getValues('content') || '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawContent;
        tempDiv.querySelectorAll('.sb-table-controls').forEach((node) => node.remove());
        const content = tempDiv.innerHTML;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) return;
        printWindow.document.write(`<!doctype html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: 'Poppins', Arial, sans-serif; color: #0f1720; padding: 32px; }
                        h1 { font-size: 20px; margin-bottom: 16px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                        th, td { border: 1px solid #cbd5f5; padding: 8px; font-size: 12px; }
                        th { background: #e2e8f0; text-transform: uppercase; letter-spacing: 0.08em; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <div>${content}</div>
                </body>
            </html>`);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    useEffect(() => {
        const editor = quillRef.current?.getEditor?.();
        if (!editor) return;

        const updateFromSelection = (range) => {
            if (!range) return;
            const format = editor.getFormat(range);
            const font = format.font && FONT_WHITELIST.includes(format.font) ? format.font : DEFAULT_FONT;
            const size = clampSize(parseSizeValue(format.size));
            setCurrentFont(font);
            setCustomSize(String(size));
        };

        const handleSelectionChange = (range) => {
            if (range) updateFromSelection(range);
        };

        const handleTextChange = () => {
            const range = editor.getSelection();
            if (range) updateFromSelection(range);
        };

        editor.on('selection-change', handleSelectionChange);
        editor.on('text-change', handleTextChange);
        handleTextChange();

        return () => {
            editor.off('selection-change', handleSelectionChange);
            editor.off('text-change', handleTextChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachMenuRef.current?.contains(event.target)) return;
            if (styleMenuRef.current?.contains(event.target)) return;
            if (subjectMenuRef.current?.contains(event.target)) return;
            if (rewriteMenuRef.current?.contains(event.target)) return;
            if (mobileToolsRef.current?.contains(event.target)) return;
            if (mobileShareRef.current?.contains(event.target)) return;
            setShowAttachMenu(false);
            setShowStyleMenu(false);
            setShowSubjectMenu(false);
            setShowRewriteMenu(false);
            setShowMobileTools(false);
            setShowMobileShare(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowAttachMenu(false);
                setShowStyleMenu(false);
                setShowSubjectMenu(false);
                setShowRewriteMenu(false);
                setShowMobileTools(false);
                setShowMobileShare(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const editor = getEditor();
        if (!editor) return;
        const handleTableControls = (event) => {
            const target = event.target.closest?.('[data-sb-table-action]');
            if (!target) return;
            event.preventDefault();
            const action = target.getAttribute('data-sb-table-action');
            const controls = target.closest('.sb-table-controls');
            const wrap = controls?.closest('.sb-table-wrap');
            const table =
                wrap?.querySelector('table') ||
                (controls?.previousElementSibling?.tagName === 'TABLE' ? controls.previousElementSibling : null);
            if (!table) return;
            if (action === 'add-row') {
                const cols = table.rows?.[0]?.cells?.length || 0;
                if (!cols) return;
                const row = table.insertRow(-1);
                for (let i = 0; i < cols; i += 1) {
                    const cell = row.insertCell(-1);
                    cell.innerHTML = '<br/>';
                }
            }
            if (action === 'add-col') {
                Array.from(table.rows).forEach((row) => {
                    const cell = row.insertCell(-1);
                    cell.innerHTML = '<br/>';
                });
            }
            editor.update('user');
        };
        editor.root.addEventListener('click', handleTableControls);
        return () => {
            editor.root.removeEventListener('click', handleTableControls);
        };
    }, []);



    const onSubmit = (data) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.content;
        const plainText = (tempDiv.textContent || tempDiv.innerText || '').substring(0, 150) + '...';
        const finalSubject = data.subject === 'Other' ? data.customSubject : data.subject;
        const noteData = { ...data, subject: finalSubject, plainText, lastModified: new Date().toISOString() };
        delete noteData.customSubject;
        if (id) {
            updateNote({ ...noteData, id: Number(id) });
        } else {
            addNote(noteData);
        }
        navigate('/dashboard');
    };

    const extractPlainText = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return (tempDiv.textContent || tempDiv.innerText || '').trim();
    };

    const handleSummarize = async () => {
        const content = extractPlainText(getValues('content'));
        if (!content) return alert('Please add note content first.');
        setIsGenerating(true);
        setAiResult(null);
        setShowAiModal(true);
        try {
            const summary = await summarizeNote(content);
            setAiResult({ type: 'Summary', content: summary, format: 'text' });
        } catch (error) {
            setAiResult({ type: 'Error', content: 'Summary failed. Please try again.', format: 'text' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateTable = async () => {
        const content = extractPlainText(getValues('content'));
        if (!content) return alert('Please add note content first.');
        setIsGenerating(true);
        setAiResult(null);
        setShowAiModal(true);
        try {
            const tableHtml = await generateNoteTable(content);
            const isHtmlTable = typeof tableHtml === 'string' && tableHtml.trim().toLowerCase().startsWith('<table');
            setAiResult({ type: 'Table', content: tableHtml, format: isHtmlTable ? 'html' : 'text' });
        } catch (error) {
            setAiResult({ type: 'Error', content: 'Table generation failed. Please try again.', format: 'text' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateQuiz = async () => {
        const content = extractPlainText(getValues('content'));
        if (!content) return alert('Please add note content first.');
        setIsGenerating(true);
        setShowAiModal(false);
        try {
            const questions = await generateQuizFromNote(content);
            navigate('/take-quiz', {
                state: {
                    questions,
                    source: getValues('title') || 'Generated from Note',
                    noteId: id,
                },
            });
        } catch (error) {
            alert('Quiz generation failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRewrite = async () => {
        const content = extractPlainText(getValues('content'));
        if (!content) return alert('Please add note content first.');
        setIsGenerating(true);
        setAiResult(null);
        setShowAiModal(true);
        try {
            const rewritten = await rewriteNote(content, rewriteStyle);
            setAiResult({ type: `Rewrite (${rewriteStyle})`, content: rewritten, format: 'text' });
        } catch (error) {
            setAiResult({ type: 'Error', content: 'Rewrite failed. Please try again.', format: 'text' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAppendAi = () => {
        if (!aiResult) return;
        const current = getValues('content') || '';
        const aiBody =
            aiResult.format === 'html'
                ? aiResult.content
                : `<div class="sb-ai-appended-content">${renderMarkdown(aiResult.content)}</div>`;
        setValue('content', `${current}<hr/><h2>AI ${aiResult.type}</h2>${aiBody}`);
        setShowAiModal(false);
    };

    return (
        <div className="sb-container space-y-8">
            <div className="space-y-5 w-full max-w-5xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="sb-btn sb-btn-ghost"
                >
                    <HiOutlineArrowLeft /> Back
                </button>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="max-w-xl">
                        <p className="sb-kicker">Notebook</p>
                        <h1 className="font-display text-3xl md:text-4xl text-white">
                            {id ? 'Refine your note' : 'Create a new note'}
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 max-w-xl">
                            Capture insights, then use Gemini to summarize, tabulate, or build a 5-question quiz in seconds.
                        </p>
                    </div>
                </div>
            </div>

            <form
                id="note-form"
                onSubmit={handleSubmit(onSubmit)}
                className="sb-note-grid gap-8 w-full max-w-5xl mx-auto"
            >
                <div className="sb-card sb-note-subject space-y-4">
                    <div>
                        <label className="sb-kicker">Subject</label>
                        <div className="relative mt-2 sb-subject-select">
                            <select
                                {...register('subject', { required: 'Subject is required' })}
                                className="sb-select"
                            >
                                <option value="">Select subject</option>
                                {SUBJECT_OPTIONS.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                            <HiChevronDown className="sb-select-icon" />
                        </div>
                        <div className="relative mt-2 sb-subject-mobile" ref={subjectMenuRef}>
                            <button
                                type="button"
                                className="sb-select sb-subject-trigger"
                                onClick={() => setShowSubjectMenu((prev) => !prev)}
                                aria-haspopup="listbox"
                                aria-expanded={showSubjectMenu}
                            >
                                <span>{selectedSubject || 'Select subject'}</span>
                                <HiChevronDown className="sb-select-icon" />
                            </button>
                            {showSubjectMenu && (
                                <div className="sb-subject-menu" role="listbox">
                                    {SUBJECT_OPTIONS.map((subject) => (
                                        <button
                                            type="button"
                                            key={subject}
                                            className={`sb-subject-option ${selectedSubject === subject ? 'active' : ''}`}
                                            onClick={() => {
                                                setValue('subject', subject, { shouldValidate: true, shouldDirty: true });
                                                setShowSubjectMenu(false);
                                            }}
                                            role="option"
                                            aria-selected={selectedSubject === subject}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.subject && (
                            <p className="text-amber-300 text-xs mt-2">{errors.subject.message}</p>
                        )}
                    </div>

                    {selectedSubject === 'Other' && (
                        <div>
                            <label className="sb-kicker">Custom Subject</label>
                            <input
                                {...register('customSubject', {
                                    required: selectedSubject === 'Other' ? 'Custom subject is required' : false,
                                })}
                                className="sb-input mt-2"
                                placeholder="Enter custom subject"
                            />
                            {errors.customSubject && (
                                <p className="text-amber-300 text-xs mt-2">{errors.customSubject.message}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="sb-card sb-editor-card sb-note-editor space-y-4">
                    <div>
                        <label className="sb-kicker">Title</label>
                        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                            <input
                                {...register('title', { required: 'Title is required' })}
                                className="sb-input flex-1"
                                placeholder="Enter note title"
                            />
                            <button
                                type="submit"
                                form="note-form"
                                className="sb-btn sb-btn-primary sb-btn-input md:w-auto w-full order-first md:order-last"
                            >
                                <HiOutlineSave /> Save Note
                            </button>
                        </div>
                        {errors.title && (
                            <p className="text-amber-300 text-xs mt-2">{errors.title.message}</p>
                        )}
                    </div>
                    <div className="space-y-2 sb-editor-body">
                        <div className={`sb-editor ${isEditorLight ? 'is-light' : ''}`}>
                            <div id="note-toolbar" className="ql-toolbar ql-snow sb-toolbar">
                                <div className="sb-toolbar-row">
                                    {windowWidth < 600 ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <div className="sb-tool-dropdown" ref={mobileToolsRef}>
                                                    <button
                                                        type="button"
                                                        className={`sb-tool-btn ${showMobileTools ? 'is-active' : ''}`}
                                                        onClick={() => {
                                                            setShowMobileTools(!showMobileTools);
                                                            setShowMobileShare(false);
                                                        }}
                                                        title="Tools"
                                                    >
                                                        <HiOutlinePencilAlt />
                                                    </button>
                                                    {showMobileTools && (
                                                        <div className="sb-tool-menu sb-mobile-menu">
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    insertCheckbox();
                                                                    setShowMobileTools(false);
                                                                }}
                                                            >
                                                                <HiOutlineCheck /> Checkbox
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    insertTable();
                                                                    setShowMobileTools(false);
                                                                }}
                                                            >
                                                                <HiOutlineTable /> Table
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    handleAttachAction('url');
                                                                    setShowMobileTools(false);
                                                                }}
                                                            >
                                                                <HiOutlineLink /> Link
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    setShowStyleMenu(true);
                                                                    setShowMobileTools(false);
                                                                }}
                                                            >
                                                                <span className="font-bold">Aa</span> Styling
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="sb-tool-dropdown" ref={mobileShareRef}>
                                                    <button
                                                        type="button"
                                                        className={`sb-tool-btn ${showMobileShare ? 'is-active' : ''}`}
                                                        onClick={() => {
                                                            setShowMobileShare(!showMobileShare);
                                                            setShowMobileTools(false);
                                                        }}
                                                        title="Share Options"
                                                    >
                                                        <HiOutlineShare />
                                                    </button>
                                                    {showMobileShare && (
                                                        <div className="sb-tool-menu sb-mobile-menu">
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    handleSharePdf();
                                                                    setShowMobileShare(false);
                                                                }}
                                                            >
                                                                <HiOutlineShare /> Share Note
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    handleDownloadPdf();
                                                                    setShowMobileShare(false);
                                                                }}
                                                            >
                                                                <HiOutlineDownload /> Download PDF
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="sb-tool-menu-item"
                                                                onClick={() => {
                                                                    handlePrintNote();
                                                                    setShowMobileShare(false);
                                                                }}
                                                            >
                                                                <HiOutlinePrinter /> Print Note
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sb-toolbar-right">
                                                <div className="sb-toolbar-cluster">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditorLight((prev) => !prev)}
                                                        className="sb-theme-icon-btn"
                                                        title={isEditorLight ? 'Switch to dark mode' : 'Switch to light mode'}
                                                    >
                                                        {isEditorLight ? <HiOutlineMoon /> : <HiOutlineSun />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="sb-toolbar-left">
                                                {/* Optional left spacer or extra elements */}
                                            </div>
                                            <div className="sb-toolbar-center">
                                                <div className="sb-toolbar-cluster">
                                                    <button type="button" className="sb-tool-btn" onClick={insertCheckbox} title="Add checkbox">
                                                        <HiOutlineCheck />
                                                    </button>
                                                    <button type="button" className="sb-tool-btn" onClick={insertTable} title="Insert table">
                                                        <HiOutlineTable />
                                                    </button>
                                                    <div className="sb-tool-dropdown" ref={attachMenuRef}>
                                                        <button
                                                            type="button"
                                                            className={`sb-tool-btn ${showAttachMenu ? 'is-active' : ''}`}
                                                            onClick={() => {
                                                                setShowAttachMenu((prev) => !prev);
                                                                setShowStyleMenu(false);
                                                            }}
                                                            title="Attach"
                                                        >
                                                            <HiOutlinePaperClip />
                                                        </button>
                                                        {showAttachMenu && (
                                                            <div className="sb-tool-menu sb-attach-menu">
                                                                <button
                                                                    type="button"
                                                                    className="sb-tool-menu-item"
                                                                    onClick={() => handleAttachAction('image')}
                                                                >
                                                                    <HiOutlinePhotograph /> Add image
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="sb-tool-menu-item"
                                                                    onClick={() => handleAttachAction('url')}
                                                                >
                                                                    <HiOutlineLink /> Add URL
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="sb-tool-menu-item"
                                                                    onClick={() => handleAttachAction('voice')}
                                                                >
                                                                    <HiOutlineMicrophone /> Add voice
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="sb-tool-menu-item"
                                                                    onClick={() => handleAttachAction('pdf')}
                                                                >
                                                                    <HiOutlinePaperClip /> Add PDF
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="sb-tool-dropdown" ref={styleMenuRef}>
                                                        <button
                                                            type="button"
                                                            className={`sb-tool-btn sb-tool-text ${showStyleMenu ? 'is-active' : ''}`}
                                                            onClick={() => {
                                                                setShowStyleMenu((prev) => !prev);
                                                                setShowAttachMenu(false);
                                                            }}
                                                            title="Text styling"
                                                        >
                                                            Aa
                                                        </button>
                                                        <div className={`sb-tool-menu sb-style-menu ${showStyleMenu ? 'is-open' : ''}`}>
                                                            <div className="sb-style-row sb-style-row-inline">
                                                                <select
                                                                    className="ql-font"
                                                                    value={currentFont}
                                                                    onChange={(event) => applyFont(event.target.value)}
                                                                    title="Font"
                                                                    aria-label="Font"
                                                                >
                                                                    <option value="">Font</option>
                                                                    <option value="poppins">Poppins</option>
                                                                    <option value="jakarta">Jakarta</option>
                                                                    <option value="grotesk">Grotesk</option>
                                                                    <option value="jetbrains">JetBrains Mono</option>
                                                                    <option value="merriweather">Merriweather</option>
                                                                    <option value="monaco">Monaco</option>
                                                                </select>
                                                                <span className="sb-size-input">
                                                                    <input
                                                                        type="number"
                                                                        min="8"
                                                                        max="120"
                                                                        step="1"
                                                                        value={customSize}
                                                                        onChange={(event) => setCustomSize(event.target.value)}
                                                                        onBlur={applyCustomSize}
                                                                        onKeyDown={(event) => {
                                                                            if (event.key === 'Enter') {
                                                                                event.preventDefault();
                                                                                applyCustomSize();
                                                                            }
                                                                        }}
                                                                        placeholder="Size"
                                                                        title="Font size"
                                                                        aria-label="Font size"
                                                                    />
                                                                    <span className="sb-size-suffix">px</span>
                                                                </span>
                                                            </div>
                                                            <div className="sb-style-row">
                                                                <button type="button" className="ql-bold" />
                                                                <button type="button" className="ql-italic" />
                                                                <button type="button" className="ql-underline" />
                                                                <button type="button" className="ql-strike" />
                                                                <button type="button" className="ql-clean" />
                                                            </div>
                                                            <div className="sb-style-row sb-align-row">
                                                                <button type="button" className="ql-align sb-align-btn" value="" title="Align left">
                                                                    L
                                                                </button>
                                                                <button type="button" className="ql-align sb-align-btn" value="center" title="Align center">
                                                                    C
                                                                </button>
                                                                <button type="button" className="ql-align sb-align-btn" value="right" title="Align right">
                                                                    R
                                                                </button>
                                                                <button type="button" className="ql-align sb-align-btn" value="justify" title="Align justify">
                                                                    J
                                                                </button>
                                                            </div>
                                                            <div className="sb-style-row">
                                                                <button type="button" className="ql-list" value="ordered" />
                                                                <button type="button" className="ql-list" value="bullet" />
                                                                <button type="button" className="ql-blockquote" />
                                                                <button type="button" className="ql-code-block" />
                                                                <button type="button" className="ql-link" />
                                                            </div>
                                                            <div className="sb-style-row">
                                                                <select className="ql-color" defaultValue="">
                                                                    <option value="">Text color</option>
                                                                    <option value="#f8fafc">Snow</option>
                                                                    <option value="#fbbf24">Amber</option>
                                                                    <option value="#f97316">Orange</option>
                                                                    <option value="#38bdf8">Sky</option>
                                                                    <option value="#14b8a6">Teal</option>
                                                                    <option value="#a855f7">Violet</option>
                                                                    <option value="#f43f5e">Rose</option>
                                                                    <option value="#22c55e">Green</option>
                                                                    <option value="#94a3b8">Slate</option>
                                                                </select>
                                                                <select className="ql-background" defaultValue="">
                                                                    <option value="">Highlight</option>
                                                                    <option value="#fef08a">Lemon</option>
                                                                    <option value="#fde68a">Honey</option>
                                                                    <option value="#fecaca">Blush</option>
                                                                    <option value="#bbf7d0">Mint</option>
                                                                    <option value="#bae6fd">Sky</option>
                                                                    <option value="#ddd6fe">Lavender</option>
                                                                    <option value="#e2e8f0">Fog</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="sb-toolbar-cluster">
                                                    <button type="button" className="sb-tool-btn" onClick={handleSharePdf} title="Share as PDF">
                                                        <HiOutlineShare />
                                                    </button>
                                                    <button type="button" className="sb-tool-btn" onClick={handleDownloadPdf} title="Download PDF">
                                                        <HiOutlineDownload />
                                                    </button>
                                                    <button type="button" className="sb-tool-btn" onClick={handlePrintNote} title="Print">
                                                        <HiOutlinePrinter />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="sb-toolbar-right">
                                                <div className="sb-toolbar-cluster">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditorLight((prev) => !prev)}
                                                        className="sb-theme-icon-btn"
                                                        title={isEditorLight ? 'Switch to dark mode' : 'Switch to light mode'}
                                                        aria-label="Toggle editor theme"
                                                    >
                                                        {isEditorLight ? <HiOutlineMoon /> : <HiOutlineSun />}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* Place the shared Style Menu dropdown for mobile here if needed, or rely on desktop anchor */}
                                {windowWidth < 600 && (
                                    <div className="sb-tool-dropdown" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} ref={styleMenuRef}>
                                        <div className={`sb-tool-menu sb-style-menu mobile-fixed ${showStyleMenu ? 'is-open' : ''}`} style={{ pointerEvents: 'auto', left: '50%', transform: 'translateX(-50%)', top: '50px', zIndex: 1000 }}>
                                            <div className="flex justify-between items-center mb-2 px-2">
                                                <span className="sb-kicker text-[10px]">Text Styling</span>
                                                <button onClick={() => setShowStyleMenu(false)} className="text-slate-400 hover:text-white">✕</button>
                                            </div>
                                            <div className="sb-style-row sb-style-row-inline">
                                                <select
                                                    className="ql-font"
                                                    value={currentFont}
                                                    onChange={(event) => applyFont(event.target.value)}
                                                    title="Font"
                                                    aria-label="Font"
                                                >
                                                    <option value="">Font</option>
                                                    <option value="poppins">Poppins</option>
                                                    <option value="jakarta">Jakarta</option>
                                                    <option value="grotesk">Grotesk</option>
                                                    <option value="jetbrains">JetBrains Mono</option>
                                                    <option value="merriweather">Merriweather</option>
                                                    <option value="monaco">Monaco</option>
                                                </select>
                                                <span className="sb-size-input">
                                                    <input
                                                        type="number"
                                                        min="8"
                                                        max="120"
                                                        step="1"
                                                        value={customSize}
                                                        onChange={(event) => setCustomSize(event.target.value)}
                                                        onBlur={applyCustomSize}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter') {
                                                                event.preventDefault();
                                                                applyCustomSize();
                                                            }
                                                        }}
                                                        placeholder="Size"
                                                        title="Font size"
                                                        aria-label="Font size"
                                                    />
                                                    <span className="sb-size-suffix">px</span>
                                                </span>
                                            </div>
                                            <div className="sb-style-row">
                                                <button type="button" className="ql-bold" />
                                                <button type="button" className="ql-italic" />
                                                <button type="button" className="ql-underline" />
                                                <button type="button" className="ql-strike" />
                                                <button type="button" className="ql-clean" />
                                            </div>
                                            <div className="sb-style-row sb-align-row">
                                                <button type="button" className="ql-align sb-align-btn" value="" title="Align left">L</button>
                                                <button type="button" className="ql-align sb-align-btn" value="center" title="Align center">C</button>
                                                <button type="button" className="ql-align sb-align-btn" value="right" title="Align right">R</button>
                                                <button type="button" className="ql-align sb-align-btn" value="justify" title="Align justify">J</button>
                                            </div>
                                            <div className="sb-style-row">
                                                <button type="button" className="ql-list" value="ordered" />
                                                <button type="button" className="ql-list" value="bullet" />
                                                <button type="button" className="ql-blockquote" />
                                                <button type="button" className="ql-code-block" />
                                                <button type="button" className="ql-link" />
                                            </div>
                                            <div className="sb-style-row">
                                                <select className="ql-color" defaultValue="">
                                                    <option value="">Text color</option>
                                                    <option value="#f8fafc">Snow</option>
                                                    <option value="#fbbf24">Amber</option>
                                                    <option value="#f97316">Orange</option>
                                                    <option value="#38bdf8">Sky</option>
                                                    <option value="#14b8a6">Teal</option>
                                                    <option value="#a855f7">Violet</option>
                                                    <option value="#f43f5e">Rose</option>
                                                    <option value="#22c55e">Green</option>
                                                    <option value="#94a3b8">Slate</option>
                                                </select>
                                                <select className="ql-background" defaultValue="">
                                                    <option value="">Highlight</option>
                                                    <option value="#fef08a">Lemon</option>
                                                    <option value="#fde68a">Honey</option>
                                                    <option value="#fecaca">Blush</option>
                                                    <option value="#bbf7d0">Mint</option>
                                                    <option value="#bae6fd">Sky</option>
                                                    <option value="#ddd6fe">Lavender</option>
                                                    <option value="#e2e8f0">Fog</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInsert} />
                            <Controller
                                name="content"
                                control={control}
                                rules={{ required: 'Content is required' }}
                                render={({ field }) => (
                                    <QuillErrorBoundary
                                        fallback={
                                            <textarea
                                                value={field.value || ''}
                                                onChange={(event) => field.onChange(event.target.value)}
                                                onBlur={() => field.onBlur()}
                                                placeholder="Start writing or paste your notes here..."
                                                className="sb-textarea sb-editor__fallback"
                                            />
                                        }
                                    >
                                        <ReactQuill
                                            ref={quillRef}
                                            value={field.value || ''}
                                            onChange={(value) => field.onChange(value)}
                                            onBlur={() => field.onBlur()}
                                            theme="snow"
                                            modules={modules}
                                            formats={formats}
                                            placeholder="Start writing or paste your notes here..."
                                            className="sb-editor__quill"
                                        />
                                    </QuillErrorBoundary>
                                )}
                            />
                            <div className="sb-word-count" aria-live="polite">
                                {wordCount} {wordCount === 1 ? 'word' : 'words'}
                            </div>
                        </div>
                        {errors.content && (
                            <p className="text-amber-300 text-xs mt-2">{errors.content.message}</p>
                        )}
                    </div>
                </div>

                <aside className="space-y-6 sb-note-aside">
                    <div className="sb-card h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="sb-kicker">AI Studio</p>
                                <h3 className="font-display text-lg text-white">Gemini Actions</h3>
                            </div>
                            <span className="sb-tag">AI</span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 sb-scroll space-y-4">
                            <p className="text-slate-400 text-sm">
                                Run a summary, generate a table, or launch a 5-question quiz from this note.
                            </p>
                            <div className="grid gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRewriteOptions((prev) => !prev)}
                                    className="sb-btn sb-btn-subtle w-full justify-start"
                                >
                                    <HiOutlinePencilAlt className="text-amber-200" /> Rewrite Notes
                                </button>
                                {showRewriteOptions && (
                                    <div className="sb-card-soft space-y-3">
                                        <div className="space-y-2">
                                            <label className="sb-kicker">Rewrite style</label>
                                            <div className="relative mt-2 sb-subject-mobile" ref={rewriteMenuRef}>
                                                <button
                                                    type="button"
                                                    className="sb-select sb-subject-trigger"
                                                    onClick={() => setShowRewriteMenu((prev) => !prev)}
                                                    aria-haspopup="listbox"
                                                    aria-expanded={showRewriteMenu}
                                                >
                                                    <span>{rewriteStyle || 'Select style'}</span>
                                                    <HiChevronDown className="sb-select-icon" />
                                                </button>
                                                {showRewriteMenu && (
                                                    <div className="sb-subject-menu" role="listbox">
                                                        {REWRITE_STYLES.map((style) => (
                                                            <button
                                                                type="button"
                                                                key={style}
                                                                className={`sb-subject-option ${rewriteStyle === style ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setRewriteStyle(style);
                                                                    setShowRewriteMenu(false);
                                                                }}
                                                                role="option"
                                                                aria-selected={rewriteStyle === style}
                                                            >
                                                                {style}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handleRewrite} className="sb-btn sb-btn-primary flex-1 text-xs">
                                                Rewrite with Gemini
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowRewriteOptions(false)}
                                                className="sb-btn sb-btn-ghost text-xs px-3"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <button type="button" onClick={handleSummarize} className="sb-btn sb-btn-subtle w-full justify-start">
                                    <HiOutlineSparkles className="text-emerald-200" /> Summarize Notes
                                </button>
                                <button type="button" onClick={handleGenerateTable} className="sb-btn sb-btn-subtle w-full justify-start">
                                    <HiOutlineTable className="text-sky-200" /> Build Summary Table
                                </button>
                                <button type="button" onClick={handleGenerateQuiz} className="sb-btn sb-btn-primary sb-quiz-cta w-full justify-center">
                                    <HiSparkles className="text-white" />
                                    <span className="font-semibold tracking-wide">Gemini Quiz</span>
                                </button>
                            </div>

                            {isGenerating && (
                                <div className="sb-card-soft text-sm text-slate-300">Gemini is generating your Quiz...</div>
                            )}
                        </div>
                    </div>

                    <ResourceLinks
                        title="Note Resources"
                        kicker={id ? 'Refine your note' : 'Create a new note'}
                        description="Attach sources or files and tie them to this note."
                        defaultNoteId={id ? Number(id) : null}
                        defaultNoteTitle={watch('title')}
                        filterNoteId={id ? Number(id) : null}
                        emptyMessage="No resources linked to this note yet."
                    />
                </aside>
            </form>

            {showAiModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="sb-card max-w-3xl w-full space-y-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="sb-kicker">Gemini Output</p>
                                <h3 className="font-display text-xl text-white">
                                    {aiResult?.type || 'Generating...'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAiModal(false);
                                    setAiResult(null);
                                }}
                                className="sb-btn sb-btn-ghost text-xs"
                            >
                                Close
                            </button>
                        </div>

                        {isGenerating && (
                            <div className="sb-card-soft text-sm text-slate-300">
                                Gemini is generating your Quiz...
                            </div>
                        )}

                        {!isGenerating && aiResult && (
                            <div className="sb-card-soft space-y-4">
                                {aiResult.format === 'html' ? (
                                    <div className="sb-ai-output" dangerouslySetInnerHTML={{ __html: aiResult.content }} />
                                ) : (
                                    <div className="sb-ai-output" dangerouslySetInnerHTML={{ __html: renderMarkdown(aiResult.content) }} />
                                )}
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={handleAppendAi} className="sb-btn sb-btn-primary text-xs">
                                        Insert into note
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAiModal(false);
                                            setAiResult(null);
                                        }}
                                        className="sb-btn sb-btn-ghost text-xs"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteEditor;
