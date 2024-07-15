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
    
        // Get the current active file and extract information
        const currentFile = this.app.workspace.getActiveFile();
        if (currentFile) {
            // Extract ID from the current file's content
            const currentContent = await this.app.vault.read(currentFile);
            const { id: currentId } = this.parseElement(currentContent);
            console.log(`Current Note ID: ${currentId}`);  // Log the ID of the current note
    
            // Determine the world by traversing up the folder structure or reading from the world file
            const worldName = this.extractWorldName(currentFile.path);
            console.log(`Current World Name: ${worldName}`);
        }
    
        // Parse the element type from the line text
        const match = /data-tooltip="(Single|Multi) (.*?)">/.exec(lineText);
        if (match) {
            console.log("LINKK  MATCH");
            const elementType = match[2];
            // Fetch elements of this type, excluding the current ID
            const elements = await this.fetchElements(elementType);
            // Implement an autocomplete selection here
        }
    }
    
    private extractWorldName(filePath: string): string {
        // Assumes the path format is 'OnlyWorlds/Worlds/{WorldName}/...'
        const pathParts = filePath.split('/');
        const worldIndex = pathParts.indexOf('Worlds');
        if (worldIndex !== -1 && pathParts.length > worldIndex + 1) {
            return pathParts[worldIndex + 1];
        }
        return "Unknown World";  // Default if the world name cannot be determined
    }
    private async fetchElements(elementType: string): Promise<void> {
        const fs = this.app.vault.adapter;  // Get the file system adapter
        const elementsPath = `OnlyWorlds/Worlds/OnlyWorld/Elements/${elementType}`;
        const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(elementsPath));
        console.log(`files ${files}, elementType  ${elementType}  `);
        for (const file of files) {
            const content = await this.app.vault.read(file);
            const {name, id} = this.parseElement(content);
            console.log(`Element Name: ${name}, ID: ${id}`); // Log each element's name and ID
        }
    }

    private parseElement(content: string): {name: string, id: string} {
        // Using regular expressions that extract text immediately following the specific HTML structure
        const idMatch = content.match(/<span class="text-field" data-tooltip="Text">ID<\/span>:\s*([^<]+)/);
        const nameMatch = content.match(/<span class="text-field" data-tooltip="Text">Name<\/span>:\s*([^<]+)/);
    
        return {
            id: idMatch ? idMatch[1].trim() : "Unknown ID",
            name: nameMatch ? nameMatch[1].trim() : "Unnamed Element"
        };
    }
    
}
 