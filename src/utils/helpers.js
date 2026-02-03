export const formatDate = (date) => {
    if (!date) return 'Just now';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
};

export const renderMarkdown = (text) => {
    if (!text) return '';

    // Pre-process: Bold, Underline, Links
    // Bold: **text**
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Underline: __text__
    processed = processed.replace(/__(.*?)__/g, '<u>$1</u>');

    // Links: [text](url)
    processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #22d3ee; text-decoration: underline;">$1</a>');

    // Handle Lists and Newlines
    const lines = processed.split('\n');
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    const result = [];

    lines.forEach(line => {
        const bulletMatch = line.match(/^(\s*)[\*\-]\s+(.*)$/);
        const numberMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

        if (bulletMatch) {
            if (!inList || listType !== 'ul') {
                if (inList) result.push(`</${listType}>`);
                result.push('<ul class="sb-md-list">');
                inList = true;
                listType = 'ul';
            }
            result.push(`<li>${bulletMatch[2]}</li>`);
        } else if (numberMatch) {
            if (!inList || listType !== 'ol') {
                if (inList) result.push(`</${listType}>`);
                result.push('<ol class="sb-md-list">');
                inList = true;
                listType = 'ol';
            }
            result.push(`<li>${numberMatch[2]}</li>`);
        } else {
            if (inList) {
                result.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            if (line.trim() !== '') {
                result.push(`<p>${line}</p>`);
            } else {
                result.push('<br/>');
            }
        }
    });

    if (inList) result.push(`</${listType}>`);

    return result.join('');
};

// Utility functions for the app
