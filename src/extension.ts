import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const formatCommand = vscode.commands.registerCommand('annotationEndLiner.format', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const updatedDocument = await runPreFormatters(editor.document);
            const edits = provideEdits(updatedDocument);
            const workspaceEdit = new vscode.WorkspaceEdit();
            edits.forEach(edit => workspaceEdit.replace(updatedDocument.uri, edit.range, edit.newText));
            await vscode.workspace.applyEdit(workspaceEdit);
        }
    });
    context.subscriptions.push(formatCommand);

    const languages = ['plaintext', 'markdown', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp'];
    languages.forEach(lang => {
        const provider = vscode.languages.registerDocumentFormattingEditProvider({ language: lang, scheme: 'file' }, {
            async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
                const updatedDocument = await runPreFormatters(document);
                return provideEdits(updatedDocument);
            }
        });
        context.subscriptions.push(provider);
    });
}

export function deactivate() {}

async function runPreFormatters(document: vscode.TextDocument): Promise<vscode.TextDocument> {
    const config = vscode.workspace.getConfiguration('annotationEndLiner', document.uri);
    const preFormatters = config.get<string[]>('preFormatters', []);
    
    if (!preFormatters || preFormatters.length === 0) {
        return document;
    }

    // Get the current editor configuration
    const editorConfig = vscode.workspace.getConfiguration('editor', document.uri);
    const originalFormatter = editorConfig.get<string>('defaultFormatter');

    try {
        // Run each pre-formatter in sequence
        for (const formatterId of preFormatters) {
            try {
                // Temporarily set the defaultFormatter to the pre-formatter
                await editorConfig.update('defaultFormatter', formatterId, vscode.ConfigurationTarget.Global);
                
                // Execute the format document command
                // This will apply the formatting immediately
                await vscode.commands.executeCommand('editor.action.formatDocument');
            } catch (error) {
                // If a pre-formatter fails, log and continue with the next one
                console.error(`Pre-formatter ${formatterId} failed:`, error);
            }
        }
    } finally {
        // Restore the original defaultFormatter
        if (originalFormatter !== undefined) {
            await editorConfig.update('defaultFormatter', originalFormatter, vscode.ConfigurationTarget.Global);
        } else {
            await editorConfig.update('defaultFormatter', undefined, vscode.ConfigurationTarget.Global);
        }
    }

    // Return the updated document
    // After formatting, we need to get the current version of the document
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.toString() === document.uri.toString()) {
        return editor.document;
    }
    return document;
}

function provideEdits(document: vscode.TextDocument): vscode.TextEdit[] {
    const config = vscode.workspace.getConfiguration('annotationEndLiner');
    // package.json의 default 값을 사용
    const markerLengths = config.get<{ [key: string]: number }>('markerLengths')!;
    // 한글 너비 비율은 package.json default에서 가져옵니다
    const charWidths = config.get<{ default: number; korean: number }>('charWidths')!;
    const edits: vscode.TextEdit[] = [];
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text;
        const match = /(.*?)([-=#])\2{2,}\s*$/.exec(text);
        if (match) {
            const prefix = match[1];
            const markerChar = match[2];
            const existing = match[0].slice(prefix.length).trim().length;
            const prefixWidth = computeWidth(prefix, charWidths);
            const targetLength = markerLengths[markerChar];
            const targetCount = Math.max(0, Math.floor(targetLength - prefixWidth));
            if (targetCount !== existing) {
                const newMarker = markerChar.repeat(targetCount);
                const startPos = new vscode.Position(i, prefix.length);
                const endPos = line.range.end;
                edits.push(vscode.TextEdit.replace(new vscode.Range(startPos, endPos), newMarker));
            }
        }
    }
    return edits;
}

function computeWidth(text: string, charWidths: { default: number; korean: number }): number {
    let width = 0;
    for (const ch of text) {
            const code = ch.charCodeAt(0);
            if (code <= 0x007F) {
                // ASCII and symbols
                width += charWidths.default;
            } else {
                // Non-ASCII characters (e.g., Korean)
                width += charWidths.korean;
            }
    }
    return width;
}
