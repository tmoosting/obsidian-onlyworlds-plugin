import { App, Plugin, MarkdownView, Editor, Notice, WorkspaceLeaf, EditorPosition } from 'obsidian';

export class NoteLinker extends Plugin {
    private currentEditor: Editor | null = null;

    setupLinkerListeners() {
        this.addCommand({  // Using `this.addCommand` here
            id: 'link-to-element',
            name: 'Link an element',
            hotkeys: [{
                modifiers: ["Shift"],
                key: 'l'
            }],
            checkCallback: (checking: boolean) => {
                const editor = this.currentEditor;
                if (editor) {
                    const cursor = editor.getCursor();
                    const lineText = editor.getLine(cursor.line);
                    if (this.isLineLinkField(lineText)) {
                        if (checking) return true;
                        this.linkElement(editor, cursor, lineText);
                    }
                }
                return false;
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

    private async linkElement(editor: Editor, cursor: EditorPosition, lineText: string) {
        console.log("LINKK 1");
        // Parse the element type from the line text
        const match = /data-tooltip="(Single|Multi) (.*?)">/.exec(lineText);
        if (match) {
            console.log("LINKK  MATCH");
            const elementType = match[2];
            // Fetch elements of this type
            const elements = await this.fetchElements(elementType);
            // Implement an autocomplete selection here
        }
    }

    private async fetchElements(elementType: string): Promise<any[]> {
        // Implementation depends on how you store and retrieve element data
        return []; // Placeholder
    }
}
 