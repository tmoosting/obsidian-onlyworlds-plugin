import { App, Plugin, MarkdownView, Editor, Notice, WorkspaceLeaf, EditorPosition } from 'obsidian';
import { ElementSelectionModal } from './ElementSelectionModal';

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
        const currentFile = this.app.workspace.getActiveFile();
        if (currentFile) {
            const currentContent = await this.app.vault.read(currentFile);
            const { id: currentId } = this.parseElement(currentContent); // Parses the current document for an ID
            console.log(`Current Note ID: ${currentId}`);
        
            const worldName = this.extractWorldName(currentFile.path); // Extract the world name based on the file's path
            console.log(`Current World Name: ${worldName}`);
        
            const match = /data-tooltip="(Single|Multi) (.*?)">/.exec(lineText);
            if (match) {
                const elementType = match[2];
                const elements = await this.fetchElements(elementType, worldName, currentId); // Pass the world name and current ID to fetch elements dynamically
                
                // Open the selection modal with the fetched elements
                new ElementSelectionModal(this.app, elements, (selectedElements) => {
                    this.handleElementSelection(editor, cursor, lineText, selectedElements);
                }).open();
            }
        }
    }
    
    private async fetchElements(elementType: string, worldName: string, currentId: string): Promise<{ name: string; id: string }[]> {
        const elementsPath = `OnlyWorlds/Worlds/${worldName}/Elements/${elementType}`; // Uses the dynamic world name
        const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(elementsPath));
        console.log(`Files found: ${files.length}, Element Type: ${elementType}`);
        const elements = [];
        for (const file of files) {
            const content = await this.app.vault.read(file);
            const { name, id } = this.parseElement(content);
            if (id !== currentId) { // Filter out elements with the same ID as the current note
                elements.push({ name, id });
            }
        }
        return elements;
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
   

    private parseElement(content: string): {name: string, id: string} {
        console.log("Parsing element content...");
        // Using regular expressions that extract text immediately following the specific HTML structure
        const idMatch = content.match(/<span class="text-field" data-tooltip="Text">ID<\/span>:\s*([^<\r\n-]+)/);
        const nameMatch = content.match(/<span class="text-field" data-tooltip="Text">Name<\/span>:\s*([^<\r\n-]+)/);
    
        if (idMatch) {
            console.log(`Raw ID Match: ${idMatch[1]}`);
        } else {
            console.log("No ID match found.");
        }
    
        if (nameMatch) {
            console.log(`Raw Name Match: ${nameMatch[1]}`);
        } else {
            console.log("No Name match found.");
        }
    
        const id = idMatch ? idMatch[1].trim() : "Unknown ID";
        const name = nameMatch ? nameMatch[1].trim() : "Unnamed Element";
    
        console.log(`Parsed ID: ${id}`);
        console.log(`Parsed Name: ${name}`);
    
        return { id, name };
    }

    private handleElementSelection(editor: Editor, cursor: EditorPosition, lineText: string, selectedElements: { name: string; id: string }[]) {
        // Get the current content of the line
        let lineContent = editor.getLine(cursor.line);
        console.log(`Original Line Content: ${lineContent}`);
    
        // Find the position to insert the new IDs
        const insertionPoint = lineContent.indexOf('</span>:') + '</span>:'.length;
    
        // Extract the current values if any
        let currentValues = lineContent.substring(insertionPoint).trim();
        console.log(`Current Values Before Cleanup: ${currentValues}`);
    
        // Remove any trailing unwanted characters (like the unwanted dash and newlines)
        currentValues = currentValues.replace(/[\r\n-]+/g, '').trim();
        console.log(`Current Values After Cleanup: ${currentValues}`);
    
        // Append the new IDs to the current values
        const newIds = selectedElements.map(el => el.id).join(',');
        const updatedValues = currentValues ? `${currentValues},${newIds}` : newIds;
        console.log(`Updated Values: ${updatedValues}`);
    
        // Update the line content
        const updatedLineContent = lineContent.substring(0, insertionPoint) + ' ' + updatedValues;
        console.log(`Updated Line Content: ${updatedLineContent}`);
    
        // Replace the line with the updated content
        editor.setLine(cursor.line, updatedLineContent);
    }
}
