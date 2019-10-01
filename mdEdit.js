class mdEdit {
    constructor(text) {
        this.toInterpret = text;
        this.interpreted = '';
        this.tables = [];
        this.init();
    }

    /**
     * Initialize markdown editor
     */
    init() {
        const mdBox = document.createElement('div');
        const bar = document.createElement('div');
        const editor = document.createElement('div');
        const display = document.createElement('div');
        const editorTextarea = document.createElement('textarea');
        const displayIframe = document.createElement('iframe');

        mdBox.classList.add('md', 'md-body');
        bar.classList.add('md', 'md-bar');
        editor.classList.add('md', 'md-editor');
        display.classList.add('md', 'md-display');

        displayIframe.sandbox = 'allow-same-origin allow-popups';

        editor.append(editorTextarea);
        display.append(displayIframe);
        mdBox.append(bar, editor, display);
        document.body.append(mdBox);

        this.bar = document.querySelector('.md-bar');
        this.editor = document.querySelector('.md-editor textarea');
        this.display = document.querySelector('.md-display iframe');
        this.displayContent = this.display.contentWindow.document;

        this.editor.value = this.toInterpret;
        this.editor.addEventListener('input', () => this.interpret());
        this.interpret();
    }

    /**
     * Interprets text from the editor
     */
    interpret() {
        this.toInterpret = this.editor.value;
        this.interpreted = this.md2html();
        this.showInterpreted();
    }

    /**
     * Displays interpreted text
     */
    showInterpreted() {
        this.displayContent.open();
        this.displayContent.write(this.interpreted);
        this.displayContent.close();
    }

    /**
     * Parses markdown to HTML
     * @returns {string}
     */
    md2html() {
        const split = this.toInterpret.split('\n');
        for (let i = 0; i < split.length; i++) {
            let s = split[i];
            let smo = undefined;
            if (i > 0) smo = split[i-1];

            // Headings
            s = s.replace(/^######.+$/, match => '<h6>' + match.slice(6) + '</h6>')
                .replace(/^#####.+$/, match => '<h5>' + match.slice(5) + '</h5>')
                .replace(/^####.+$/, match => '<h4>' + match.slice(4) + '</h4>')
                .replace(/^###.+$/, match => '<h3>' + match.slice(3) + '</h3>')
                .replace(/^##.+$/, match => '<h2>' + match.slice(2) + '</h2>')
                .replace(/^#.+$/, match => '<h1>' + match.slice(1) + '</h1>');

            // Images
            s = s.replace(/!\[.*?]\(.*?\)/g, match => {
                const alt = match.match(/!\[.*?]/)[0];
                const link = match.match(/\(.*?\)/)[0];
                return `<img src="${link.slice(1, link.length - 1)}" alt="${alt.slice(2, alt.length - 1)}">`;
            });

            // Links
            s = s.replace(/\[.*?]\(.*?\)/g, match => {
                const name = match.match(/\[.*?]/)[0];
                const link = match.match(/\(.*?\)/)[0];
                return `<a href="${link.slice(1, link.length - 1)}" target="_blank">${name.slice(1, name.length - 1)}</a>`;
            });

            // Emphasized
            s = s.replace(/(\*\*.*?\*\*|__.*?__)/, match => '<strong>' + match.slice(2, match.length - 2) + '</strong>')
                .replace(/(\*.*?\*|_.*?_)/, match => '<i>' + match.slice(1, match.length - 1) + '</i>')
                .replace(/~~.*?~~/, match => '<s>' + match.slice(2, match.length - 2) + '</s>');

            // Alternativ headings
            if (/^=+$/.test(s.trim())) {
                s = `<h1>${smo}</h1>`;
                delete split[i-1];
            } else if (/^-+$/.test(s.trim())) {
                s = `<h2>${smo}</h2>`;
                delete split[i-1];
            }

            split[i] = s;
        }
        return split.join('\n');
    }
}

