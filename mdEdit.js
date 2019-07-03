class mdEdit {
    constructor(text) {
        this.toInterpret = text;
        this.interpreted = '';
        this.init();
    }

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

        displayIframe.sandbox = 'allow-same-origin';

        editor.append(editorTextarea);
        display.append(displayIframe);
        mdBox.append(bar, editor, display);
        document.body.append(mdBox);

        this.bar = document.querySelector('.md-bar');
        this.editor = document.querySelector('.md-editor textarea');
        this.display = document.querySelector('.md-display iframe');
        this.displayContent = this.display.contentWindow.document;

        this.editor.addEventListener('input', () => this.interpret());
        this.interpret();
    }

    interpret() {
        this.getText();
        this.interpreted = this.md2html();
        this.showInterpreted();
    }

    getText() {
        this.toInterpret = this.editor.value;
    }

    showInterpreted() {
        this.displayContent.open();
        this.displayContent.write(this.interpreted);
        this.displayContent.close();
    }

    md2html() {
        let htmlString = '';
        for (let s of this.toInterpret.split('\n')) {
            // Headings
            if (s.match(/^######.+$/))
                s = s.replace(/^######.+$/, match => '<h6>' + match.slice(6) + '</h6>');
            else if (s.match(/^#####.+$/))
                s = s.replace(/^#####.+$/, match => '<h5>' + match.slice(5) + '</h5>');
            else if (s.match(/^####.+$/))
                s = s.replace(/^####.+$/, match => '<h4>' + match.slice(4) + '</h4>');
            else if (s.match(/^###.+$/))
                s = s.replace(/^###.+$/, match => '<h3>' + match.slice(3) + '</h3>');
            else if (s.match(/^##.+$/))
                s = s.replace(/^##.+$/, match => '<h2>' + match.slice(2) + '</h2>');
            else if (s.match(/^#.+$/))
                s = s.replace(/^#.+$/, match => '<h1>' + match.slice(1) + '</h1>');

            if (s.match(/(\*\*.*\*\*|__.*__)/))
                s = s.replace(/(\*\*.*\*\*|__.*__)/, match => '<strong>' + match.slice(2, match.length - 2) + '</strong>');
            if (s.match(/(\*.*\*|_.*_)/))
                s = s.replace(/(\*.*\*|_.*_)/, match => '<i>' + match.slice(1, match.length - 1) + '</i>');
            if (s.match(/~~.*~~/))
                s = s.replace(/~~.*~~/, match => '<s>' + match.slice(2, match.length - 2) + '</s>');

            htmlString += s;
        }
        return htmlString;
    }
}

