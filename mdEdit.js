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
        let htmlString = '';
        let split = this.toInterpret.split('\n');

        // Tables // TODO: Clear table on change (eg table to heading)
        for (let i in split) {
            let s = split[i];
            if (s.match(/^\|(.*\|)?$/igm)) {
                console.log(this.tables);
                const exists = this.tables.map(table => table.includes(i.toString())).filter(elem => elem === true).length > 0;
                const prevExists = this.tables.map(table => table.includes((i - 1).toString())).filter(elem => elem === true).length > 0;

                if (!exists && prevExists) {
                    this.tables[this.tables.map(table => table.includes((i - 1).toString())).indexOf(true)].push(i);
                } else if (!exists) {
                    this.tables.push([i]) // New table
                }
            }
        }

        // Other table stuff
        let oldSplit = split.slice(0);
        for (let table of this.tables) {
            split[parseInt(table[0])] = "<table>";
            for (let lineNum of table) {
                if (lineNum === table[0]) split[parseInt(lineNum)] += "<tr>";
                else split[parseInt(lineNum)] = "<tr>";
                const lineTokens = oldSplit[parseInt(lineNum)].split("|").filter(elem => elem !== "");
                for (let token of lineTokens) {
                    split[parseInt(lineNum)] += "<td>" + token + "</td>"
                }
                split[parseInt(lineNum)] += "</tr>";
            }
            split[parseInt(table[table.length - 1])] += "</table>";
        }

        // Replace headings
        for (let s of split) {
            // Headings
            s = s.replace(/^######.+$/, match => '<h6>' + match.slice(6) + '</h6>');
            s = s.replace(/^#####.+$/, match => '<h5>' + match.slice(5) + '</h5>');
            s = s.replace(/^####.+$/, match => '<h4>' + match.slice(4) + '</h4>');
            s = s.replace(/^###.+$/, match => '<h3>' + match.slice(3) + '</h3>');
            s = s.replace(/^##.+$/, match => '<h2>' + match.slice(2) + '</h2>');
            s = s.replace(/^#.+$/, match => '<h1>' + match.slice(1) + '</h1>');
            htmlString += s + '<br/>';
        }

        // Images
        htmlString = htmlString.replace(/!\[.*?]\(.*?\)/g, match => {
            const alt = match.match(/!\[.*]/)[0];
            const link = match.match(/\(.*\)/)[0];
            return `<img src="${link.slice(1, link.length - 1)}" alt="${alt.slice(2, alt.length - 1)}">`;
        });
        // Links
        htmlString = htmlString.replace(/\[.*?]\(.*?\)/g, match => {
            const name = match.match(/\[.*]/)[0];
            const link = match.match(/\(.*\)/)[0];
            return `<a href="${link.slice(1, link.length - 1)}" target="_blank">${name.slice(1, name.length - 1)}</a>`;
        });
        // Emphasized
        htmlString = htmlString.replace(/(\*\*.*?\*\*|__.*?__)/, match => '<strong>' + match.slice(2, match.length - 2) + '</strong>');
        htmlString = htmlString.replace(/(\*.*?\*|_.*?_)/, match => '<i>' + match.slice(1, match.length - 1) + '</i>');
        htmlString = htmlString.replace(/~~.*?~~/, match => '<s>' + match.slice(2, match.length - 2) + '</s>');

        htmlString = mdEdit.parseCode(htmlString);
        /*
            s = this.parseLists();
            s = this.parseTable();
        */
        return htmlString;
}

    /**
     * Parses markdown code blocks to HTML string
     * @param s
     * @returns {string}
     */
    static parseCode(s) {
        return s.replace(/`{3}.*?`{3}|`.*?`/g, match => {
            if (match.startsWith('\`\`\`')) return `<pre><code>${match.slice(3, match.length - 3)}</code></pre>`;
            return `<pre><code>${match.slice(1, match.length - 1)}</code></pre>`;
        })
    }
}

