class mdEdit {
    constructor(text) {
        this.toInterpret = text;
        this.interpreted = '';
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
        let htmlString = '';
        for (let s of this.toInterpret.split('\n')) {
            // Headings
            s = s.replace(/^######.+$/, match => '<h6>' + match.slice(6) + '</h6>');
            s = s.replace(/^#####.+$/, match => '<h5>' + match.slice(5) + '</h5>');
            s = s.replace(/^####.+$/, match => '<h4>' + match.slice(4) + '</h4>');
            s = s.replace(/^###.+$/, match => '<h3>' + match.slice(3) + '</h3>');
            s = s.replace(/^##.+$/, match => '<h2>' + match.slice(2) + '</h2>');
            s = s.replace(/^#.+$/, match => '<h1>' + match.slice(1) + '</h1>');

            // Images
            if (s.match(/!\[.*]\(.*\)/)) {
                s = s.replace(/!\[.*]\(.*\)/, match => {
                    const alt = match.match(/!\[.*]/)[0];
                    const link = match.match(/\(.*\)/)[0];
                    return `<img src="${link.slice(1, link.length - 1)}" alt="${alt.slice(2, alt.length - 1)}">`;
                });
            }

            // Links
            if (s.match(/\[.*]\(.*\)/)) {
                s = s.replace(/\[.*]\(.*\)/, match => {
                    const name = match.match(/\[.*]/)[0];
                    const link = match.match(/\(.*\)/)[0];
                    return `<a href="${link.slice(1, link.length - 1)}" target="_blank">${name.slice(1, name.length - 1)}</a>`;
                });
            }

            // Emphasized
            if (s.match(/(\*\*.*\*\*|__.*__)/))
                s = s.replace(/(\*\*.*\*\*|__.*__)/, match => '<strong>' + match.slice(2, match.length - 2) + '</strong>');
            if (s.match(/(\*.*\*|_.*_)/))
                s = s.replace(/(\*.*\*|_.*_)/, match => '<i>' + match.slice(1, match.length - 1) + '</i>');
            if (s.match(/~~.*~~/))
                s = s.replace(/~~.*~~/, match => '<s>' + match.slice(2, match.length - 2) + '</s>');

            htmlString += s + '<br/>';
        }

        htmlString = mdEdit.parseCode(htmlString);
        /*
            s = this.parseLists();
            s = this.parseTable();

        */
        return htmlString;
    }

    /**
     * Parses markdown code blocks
     * @param s
     * @returns {string}
     */
    static parseCode(s) {
        return s.replace(/`{3}.*`{3}|`.*`/, match => {
            if (match.startsWith('\`\`\`')) return `<pre><code>${match.slice(3, match.length - 3)}</code></pre>`;
            return `<pre><code>${match.slice(1, match.length - 1)}</code></pre>`;
        })
    }
}

