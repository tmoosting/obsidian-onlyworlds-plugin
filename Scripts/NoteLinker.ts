import { Plugin, MarkdownView, Editor, Notice, WorkspaceLeaf } from 'obsidian';

export class NoteLinker extends Plugin {
    private currentEditor: Editor | null = null;

    setupLinkerListeners() {
        this.addCommand({
            id: 'link-to-element',
            name: 'Link an element',
            hotkeys: [{
                modifiers: ["Shift"],
                key: 'l'
            }],
            callback: () => {
                if (this.currentEditor) {
                    const cursor = this.currentEditor.getCursor();
                    const lineText = this.currentEditor.getLine(cursor.line);
                    console.log(`Line text at cursor: '${lineText}'`);
                    console.log(`Cursor position: ${cursor.ch}`);
                    const isLineLinkField = this.isLineLinkField(lineText );
                  // only execute if isLineLinkField is true
                }
            }
        });

        this.registerEvent(
            this.app.workspace.on('active-leaf-change', leaf => this.handleLeafChange(leaf))
        );
    }

    handleLeafChange(leaf: WorkspaceLeaf | null) {
        if (leaf && leaf.view instanceof MarkdownView) {
            this.currentEditor = leaf.view.editor;
        } else {
            this.currentEditor = null;
        }
    }
    private isLineLinkField(line: string): boolean {
        return /<span class="(link-field|multi-link-field)"[^>]*>/.test(line);
    }
    
    
    
}
