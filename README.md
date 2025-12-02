# Annotation End Liner

A VSCode extension that formats comments by extending marker characters to a configurable column width.

## Features

- **Automatic Comment Line Extension**: Extends comment lines ending with repeated markers (`---`, `===`, `###`) to a specified column
- **Customizable Character Widths**: Configure how different character types (ASCII, Korean, etc.) contribute to column width
- **Configurable Marker Lengths**: Set different target column lengths for different marker types
- **Pre-Formatter Support**: Run other formatters (like Prettier, ESLint) before applying annotation formatting

## Usage

### Basic Formatting

When you have a comment line ending with three or more consecutive marker characters, this extension will extend them to a configured column:

**Before:**
```javascript
// Example ---
```

**After** (with default 80 column setting for `-`):
```javascript
// Example --------------------------------------------------------------------
```

### Triggering Format

1. **Manual Command**: `Ctrl+Alt+F` (or `Cmd+Alt+F` on Mac)
2. **Format Document**: `Shift+Alt+F` (or `Shift+Option+F` on Mac)
3. **Format on Save**: Enable `editor.formatOnSave` in VSCode settings

### Supported Markers

- `-` (dash): Default target column 80
- `=` (equals): Default target column 100
- `#` (hash): Default target column 120

## Configuration

### GUI Configuration

All settings can be configured through the VSCode Settings UI:

1. Open Settings: `File` → `Preferences` → `Settings` (or `Ctrl+,`)
2. Search for "Annotation End Liner"
3. Modify settings as needed

### JSON Configuration

Alternatively, edit your `settings.json` directly:

```json
{
  "annotationEndLiner.charWidths": {
    "default": 1,
    "korean": 1.645
  },
  "annotationEndLiner.markerLengths": {
    "-": 80,
    "=": 100,
    "#": 120
  },
  "annotationEndLiner.preFormatters": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### Settings Reference

#### `annotationEndLiner.charWidths`

Configure how many columns each character type occupies. This is useful for languages with wide characters.

**Type**: `object`

**Default**:
```json
{
  "default": 1,
  "korean": 1.645
}
```

**Example**:
```json
{
  "annotationEndLiner.charWidths": {
    "default": 1,
    "korean": 1.5,
    "japanese": 2
  }
}
```

#### `annotationEndLiner.markerLengths`

Specify the target column length for each marker character type.

**Type**: `object`

**Default**:
```json
{
  "-": 80,
  "=": 100,
  "#": 120
}
```

**Example**:
```json
{
  "annotationEndLiner.markerLengths": {
    "-": 100,
    "=": 120,
    "#": 140
  }
}
```

#### `annotationEndLiner.preFormatters`

List of formatter extension IDs to run **before** annotation formatting. Formatters are executed in the order specified.

**Type**: `array` of strings

**Default**: `[]` (no pre-formatters)

**Example**:
```json
{
  "annotationEndLiner.preFormatters": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### Pre-Formatter Usage Examples

#### Example 1: Prettier + Annotation End Liner

```json
{
  "annotationEndLiner.preFormatters": ["esbenp.prettier-vscode"]
}
```

This will:
1. Run Prettier to format your code
2. Then apply annotation line extension

#### Example 2: ESLint + Prettier + Annotation End Liner

```json
{
  "annotationEndLiner.preFormatters": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

This will:
1. Run ESLint to fix linting issues
2. Run Prettier to format code
3. Apply annotation line extension

#### Example 3: Language-Specific Configuration

You can also configure formatters per language:

```json
{
  "[javascript]": {
    "annotationEndLiner.preFormatters": [
      "esbenp.prettier-vscode"
    ]
  },
  "[python]": {
    "annotationEndLiner.preFormatters": [
      "ms-python.black-formatter"
    ]
  }
}
```

## Finding Formatter Extension IDs

To find the extension ID of a formatter:

1. Open Extensions view in VSCode (`Ctrl+Shift+X`)
2. Click on the formatter extension
3. Look for the ID under the extension name (usually in the format `publisher.extension-name`)

Common formatter IDs:
- Prettier: `esbenp.prettier-vscode`
- ESLint: `dbaeumer.vscode-eslint`
- Black (Python): `ms-python.black-formatter`
- clang-format (C/C++): `xaver.clang-format`

## Supported Languages

- Plain Text
- Markdown
- JavaScript
- TypeScript
- Python
- Java
- C
- C++

## Examples

### JavaScript with Markers

```javascript
// Main section ---
function example() {
  // Subsection ===
  console.log("Hello");
  
  // Important note ###
  return true;
}
```

After formatting (with defaults):
```javascript
// Main section ----------------------------------------------------------------
function example() {
  // Subsection ==============================================================================
  console.log("Hello");
  
  // Important note ##########################################################################################
  return true;
}
```

### Python with Markers

```python
# Configuration Section ---
CONFIG = {
    'debug': True
}

# Helper Functions ===
def helper():
    # Implementation Details ###
    pass
```

## Troubleshooting

### Pre-formatters not working

1. Ensure the formatter extension is installed and enabled
2. Verify the extension ID is correct (check in Extensions view)
3. Check that the formatter supports the current file type
4. Try running the formatter manually first to ensure it works

### Markers not extending

1. Ensure you have at least 3 consecutive marker characters (`---`, `===`, or `###`)
2. Check your `markerLengths` configuration
3. Verify the marker characters are at the end of the line (trailing whitespace is OK)

## Contributing

Issues and pull requests are welcome at [https://github.com/yes89929/annotation-end-liner](https://github.com/yes89929/annotation-end-liner)

## License

[MIT](LICENSE)
