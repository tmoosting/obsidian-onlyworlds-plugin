import { App, Modal, Notice } from 'obsidian';

export class WorldPasteModal extends Modal {
    onSubmit: (jsonData: any) => void;

    constructor(app: App, onSubmit: (jsonData: any) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.createEl('h3', { text: 'Create World From World Data' });

        // Create a textarea element
        let inputArea = contentEl.createEl('textarea', {
            placeholder: 'Insert JSON data here...',
            attr: {
                style: 'width: 100%; min-height: 200px; border: 1px solid grey; padding: 10px;'
            }
        });

        // Create a submit button
        const submitButton = contentEl.createEl('button', { text: 'Submit' });
        submitButton.style.opacity = '0.5';  // Start with the button greyed out
        submitButton.disabled = true;        // Start with the button disabled

        inputArea.addEventListener('input', (e) => {
            const value = (e.target as HTMLTextAreaElement).value;
            if (!value) {
                inputArea.style.borderColor = 'grey'; // Default border color
                submitButton.style.opacity = '0.5';
                submitButton.disabled = true;
                return;
            }
            if (this.isValidJSON(value)) {
                inputArea.style.borderColor = 'lightgreen'; // Green border for valid JSON
                submitButton.style.opacity = '1.0';
                submitButton.disabled = false;
            } else {
                inputArea.style.borderColor = 'salmon'; // Red border for invalid JSON
                submitButton.style.opacity = '0.5';
                submitButton.disabled = true;
            }
        });

        submitButton.onclick = () => {
            if (!submitButton.disabled) {
                this.onSubmit(JSON.parse(inputArea.value)); 
                this.close();
            }
        };
    }

    isValidJSON(str: string): boolean {
        try {
            const data = JSON.parse(str);
            const requiredCategories = [
                "Character", "Object", "Location", "Species", "Territory", "Institution", 
                "Family", "Creature", "Collective", "Trait", "Phenomenon", "Title", "Ability", 
                "Language", "Law", "Relation", "Event", "Construct"
            ];
    
            // Check for all required categories
            for (let category of requiredCategories) {
                if (!data[category] || !Array.isArray(data[category])) {
                    return false; // Each category must exist and be an array
                }
            }
    
            // Special handling for "World" to ensure it contains specific fields
            const requiredWorldFields = [
                "id", "api_key", "name", "description", "user_id", "ow_version", 
                "image_url", "focus_text", "time_format_names", "time_format_equivalents", 
                "time_basic_unit", "time_current", "time_range_min", "time_range_max"
            ];
    
            const world = data["World"];
            if (!world || typeof world !== 'object') {
                return false;
            }
    
            for (let field of requiredWorldFields) {
                if (world[field] === undefined) {
                    return false; // Each specified field must exist in the "World" object
                }
            }
    
            return true; // All checks passed
        } catch (e) {
            return false;
        }
    }
    

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
