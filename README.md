# DataGrid PCF Control

A Power Apps Component Framework (PCF) control that renders a fully-featured data grid in **Canvas apps**. Built with React and TypeScript as a `virtual` control.

## Features

- **Data binding** — accepts any JSON array via `JSON(yourCollection)` — works with Dataverse, SharePoint, SQL, Collections, or static data
- **Sorting** — click column headers to sort ascending/descending
- **Filtering** — per-column filter support
- **Search** — full-text search bar across all visible columns
- **Pagination** — configurable page size
- **Inline editing** — edit cell values directly in the grid with a local save indicator
- **Row selection** — single-row selection with output back to Canvas
- **Column resizing** — drag column borders to resize
- **Frozen columns** — pin N columns from the left
- **Theming** — primary color, font size, row height, alternate row color, grid lines

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Power Apps environment where **"Power Apps component framework for canvas apps"** is enabled in the Admin Center

## Local Development

```bash
npm install
npm start
```

Opens the PCF test harness at `http://localhost:8181`.

> **Note:** `postinstall.js` automatically patches a known bug in `pcf-scripts@1.51.1` after every `npm install`.

## Build & Package

```bash
npm run package
```

This will:
1. Compile and bundle the control in **production mode**
2. Embed the manifest and bundle directly into `customizations.xml`
3. Output `DataGridPCFSolution.zip` in the project root

> **No `pac` CLI required** — the zip is built entirely with Node.js built-ins.

## Deploy to a New Environment

### Step 1 — Enable the PCF feature flag (admin, one-time)

1. Go to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
2. **Environments** → select your environment → **Settings** → **Product** → **Features**
3. Enable **"Power Apps component framework for canvas apps"** → Save

### Step 2 — Import the solution

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Select your environment (top-right corner)
3. **Solutions → Import solution**
4. Upload `DataGridPCFSolution.zip` → **Next → Import**
5. After import completes, click **Publish All Customizations**
6. Wait ~30 seconds, then hard-refresh the browser (`Ctrl+Shift+R`)

### Step 3 — Add to a Canvas app

1. Open or create a Canvas app
2. **Insert → Get more components → Code tab**
3. Select **DataGridControl** → **Import**
4. Insert it onto a screen: **Insert → Code components → DataGridControl**
5. Set the `DataJson` property to your data source (see below)

## Canvas App Configuration

### Data

Bind `DataJson` to any data source using the `JSON()` function:

```
// From a Collection
DataGridControl1.DataJson = JSON(MyCollection)

// From SharePoint
DataGridControl1.DataJson = JSON('My SharePoint List')

// From a Dataverse table
DataGridControl1.DataJson = JSON(Accounts)

// Static test data
DataGridControl1.DataJson = "[{""Name"":""Alice"",""Age"":""30""},{""Name"":""Bob"",""Age"":""25""}]"
```

### Properties

| Property | Type | Description |
|---|---|---|
| `DataJson` | Text | **Required.** JSON array of row objects — use `JSON(yourSource)` |
| `ColumnConfig` | Text (JSON) | Override column labels, widths, alignment. Example: `[{"name":"Name","label":"Full Name","width":200,"align":"left"}]` |
| `HeaderHeight` | Number | Header row height in pixels (default: 42) |
| `WrapHeaderText` | Yes/No | Wrap long header labels |
| `HeaderHorizontalAlign` | Text | `left`, `center`, or `right` (default: `left`) |
| `HeaderVerticalAlign` | Text | `top`, `middle`, or `bottom` (default: `middle`) |
| `EnableRowSelection` | Yes/No | Allow row selection — outputs `SelectedRowId` |
| `EnableInlineEdit` | Yes/No | Allow editing cell values in-grid |
| `ShowLocalSaveIndicator` | Yes/No | Show save/discard toolbar when edits are pending |
| `ShowPagination` | Yes/No | Show pagination controls (default: true) |
| `PageSize` | Number | Rows per page (default: 50) |
| `ShowSearch` | Yes/No | Show the search bar (default: true) |
| `PrimaryColor` | Text | Hex color for header and accents (default: `#0078d4`) |
| `AlternateRowColor` | Yes/No | Stripe alternate rows (default: true) |
| `ShowGridLines` | Yes/No | Show cell borders (default: true) |
| `FontSize` | Number | Font size in pixels (default: 14) |
| `RowHeight` | Number | Data row height in pixels (default: 36) |
| `FrozenColumns` | Number | Number of columns to pin from the left (default: 0) |

### Outputs

| Output | Type | Description |
|---|---|---|
| `SelectedRowId` | Text | Index (as string) of the selected row, or empty |
| `DirtyEditCount` | Number | Number of unsaved inline edits |

## Project Structure

```
├── index.ts                     # PCF entry point (ReactControl)
├── App.tsx                      # Root React component — parses DataJson, builds columns
├── ManifestTypes.ts             # IInputs / IOutputs type definitions
├── ControlManifest.Input.xml    # PCF manifest (properties, control-type=virtual)
├── package.json                 # Scripts: start, build, package
├── package.js                   # Builds DataGridPCFSolution.zip (no pac required)
├── webpack.config.js            # Custom webpack config
├── postinstall.js               # Auto-patches pcf-scripts startTask.js bug
├── featureconfig.json           # Enables custom webpack (pcfAllowCustomWebpack)
├── components/
│   ├── DataGrid.tsx             # Main grid component
│   ├── GridHeader.tsx           # Sortable, resizable column headers
│   ├── GridRow.tsx              # Row rendering
│   ├── GridCell.tsx             # Cell with inline edit support
│   ├── Pagination.tsx           # Pagination controls
│   ├── SearchBar.tsx            # Search input
│   └── Toolbar.tsx              # Save/discard indicator
├── hooks/
│   ├── useFiltering.ts          # Filter logic
│   ├── useSorting.ts            # Sort logic
│   ├── usePagination.ts         # Pagination logic
│   ├── useSelection.ts          # Row selection logic
│   └── useColumnResize.ts       # Column resize drag logic
└── models/
    ├── GridColumn.ts            # GridColumn type definition
    └── GridTheme.ts             # Theme helpers
```

## Solution Details

| Field | Value |
|---|---|
| Namespace | `SampleNamespace` |
| Constructor | `DataGridControl` |
| Control version | `1.0.1` |
| Control type | `virtual` (Canvas app compatible) |
| Solution name | `DataGridPCFSolution` |
| Solution version | `1.0.1.0` |
| Publisher | `DataGridPCFPub` (prefix: `dgp`) |
| API version | `1.3.18` |

## Tech Stack

| Package | Version | Notes |
|---|---|---|
| `pcf-scripts` | 1.51.1 | PCF build toolchain |
| `react` | 17.0.2 | v17 — Power Apps platform provides its own React |
| `typescript` | 4.5.5 | Constrained by pcf-scripts |
| `@types/powerapps-component-framework` | 1.3.18 | PCF type definitions |

