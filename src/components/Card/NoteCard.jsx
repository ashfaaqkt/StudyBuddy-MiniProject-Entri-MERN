import { useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineClock } from 'react-icons/hi';
import { formatDate } from '../../utils/helpers';

const NoteCard = ({ note, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/edit-note/${note.id}`)}
            className="sb-card cursor-pointer transition-all hover:-translate-y-1 hover:border-white/20"
        >
            <div className="flex items-start justify-between gap-4">
                <span className="sb-tag">{note.subject}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                    }}
                    className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Delete Note"
                >
                    <HiOutlineTrash className="text-lg" />
                </button>
            </div>

            <h3 className="font-display text-xl text-white mt-5 mb-3 line-clamp-2">
                {note.title}
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                {note.plainText || 'No preview available yet. Open the note to start writing.'}
            </p>

            <div className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                <HiOutlineClock className="text-emerald-200" />
                <span>Updated {formatDate(note.lastModified || note.createdAt)}</span>
            </div>
        </div>
    );
};

export default NoteCard;
