# DataGrid PCF Control

A Power Apps Component Framework (PCF) control that renders a fully-featured data grid in **Canvas apps**. Built with React and TypeScript as a `virtual` control (no DOM management — the platform handles the React lifecycle).

## Features

- **Data binding** — connects to any PCF DataSet (Dataverse table, collection, etc.)
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

- [Node.js](https://nodejs.org/) v18+ (tested on v24)
- [Power Platform CLI (`pac`)](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) v2.8+
- .NET 8 SDK (required by `pac`)
- A Power Apps environment where your user has **System Administrator** or **System Customizer** role (required to import PCF controls)

## Local Development

```bash
npm install
npm start
```

Opens the PCF test harness at `http://localhost:8181`. Use the harness to feed mock data and interact with the control before deploying.

> **Note:** `postinstall.js` automatically patches a known bug in `pcf-scripts@1.51.1` (`startTask.js`) after every `npm install`. No manual steps needed.

## Build & Package

```bash
npm run package
```

This will:
1. Compile and bundle the control in **production mode** (minified, no `eval`)
2. Pack a Dataverse solution zip via `pac solution pack`
3. Output `DataGridPCFSolution.zip` in the project root

## Deploy to a New Environment

Follow these steps to deploy to any Power Apps environment from scratch.

### Step 1 — Set up the machine (first time only)

Install the required tools if not already present:

```powershell
# Node.js (v18+) — https://nodejs.org
# .NET 8 SDK — https://dotnet.microsoft.com/download

# Power Platform CLI
winget install Microsoft.PowerPlatformCLI
```

After installing, refresh your PATH:
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

Verify:
```powershell
pac --version   # should show 2.8+
node --version  # should show v18+
dotnet --version # should show 8.x
```

### Step 2 — Clone and install

```bash
git clone https://github.com/EdmondFanah/Powerapps.git
cd Powerapps
npm install
```

> `postinstall.js` runs automatically and patches a known `pcf-scripts` bug. No extra steps needed.

### Step 3 — Build and package the solution

```bash
npm run package
```

This produces `DataGridPCFSolution.zip` in the project root — a ready-to-import Dataverse unmanaged solution.

### Step 4 — Authenticate with Power Platform CLI

```powershell
pac auth create --environment https://<your-org>.crm.dynamics.com
```

Sign in with your credentials when the browser opens. Replace `<your-org>` with your environment URL (found in [Power Platform Admin Center](https://admin.powerplatform.microsoft.com) → Environments → your env → Settings → Environment URL).

### Step 5 — Import the solution

**Option A — via browser (recommended):**
1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Select your environment (top-right corner)
3. **Solutions → Import solution**
4. Upload `DataGridPCFSolution.zip`
5. Click **Next → Import**

**Option B — via CLI:**
```powershell
pac solution import --path DataGridPCFSolution.zip
```

After import, the control appears in Canvas apps under **Insert → Custom → DataGridControl**.

### Step 6 — Grant permissions (if import fails)

If the import fails with `missing prvCreateCustomControl privilege`:

1. Go to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
2. Select your environment → **Settings → Users + permissions → Security roles**
3. Open the role assigned to your user
4. Go to the **Customization** tab → find **Custom Control** → enable **Create**
5. Save, then retry the import

Alternatively, ask a System Administrator to either import the solution on your behalf or temporarily assign you the **System Customizer** role.

### Step 7 — Add to a Canvas app

1. Open or create a Canvas app at [make.powerapps.com](https://make.powerapps.com)
2. **Insert → Get more components** (if the control is not yet listed)
3. Search for `DataGridControl` → **Import**
4. Insert it onto a screen: **Insert → Custom → DataGridControl**
5. In the right panel, connect `sampleDataSet` to a data source (e.g. a Dataverse table)
6. Configure properties as needed (see [Canvas App Configuration](#canvas-app-configuration) below)

## Canvas App Configuration

After adding the control to a Canvas app screen, connect a data source and configure properties in the right panel:

### Data
| Property | Type | Description |
|---|---|---|
| `sampleDataSet` | DataSet | The data source (table, collection, etc.) |

### Columns
| Property | Type | Description |
|---|---|---|
| `ColumnConfig` | Text (JSON) | Override column labels, widths, and alignment. Example: `[{"name":"cr123_name","label":"Full Name","width":200,"align":"left","visible":true}]` |

### Header
| Property | Type | Description |
|---|---|---|
| `HeaderHeight` | Number | Header row height in pixels |
| `WrapHeaderText` | Yes/No | Wrap long header labels |
| `HeaderHorizontalAlign` | Text | `left`, `center`, or `right` |
| `HeaderVerticalAlign` | Text | `top`, `middle`, or `bottom` |

### Editing
| Property | Type | Description |
|---|---|---|
| `EnableRowSelection` | Yes/No | Allow row selection (outputs `SelectedRowId`) |
| `EnableInlineEdit` | Yes/No | Allow editing cell values in-grid |
| `ShowLocalSaveIndicator` | Yes/No | Show save/discard toolbar when edits are pending |

### Pagination
| Property | Type | Description |
|---|---|---|
| `ShowPagination` | Yes/No | Show pagination controls |
| `PageSize` | Number | Rows per page (default: 10) |

### Search
| Property | Type | Description |
|---|---|---|
| `ShowSearch` | Yes/No | Show the search bar |

### Appearance
| Property | Type | Description |
|---|---|---|
| `PrimaryColor` | Text | Hex color for header and accents (e.g. `#0078d4`) |
| `AlternateRowColor` | Yes/No | Stripe alternate rows |
| `ShowGridLines` | Yes/No | Show cell borders |
| `FontSize` | Number | Font size in pixels |
| `RowHeight` | Number | Data row height in pixels |
| `FrozenColumns` | Number | Number of columns to pin from the left |

## Project Structure

```
├── index.ts                     # PCF entry point (ReactControl)
├── App.tsx                      # Root React component — maps PCF inputs to grid props
├── ManifestTypes.ts             # IInputs / IOutputs type definitions
├── ControlManifest.Input.xml    # PCF manifest (properties, data-set, control-type=virtual)
├── package.json                 # Scripts: start, build, package
├── webpack.config.js            # Custom webpack (ts-loader with transpileOnly)
├── postinstall.js               # Auto-patches pcf-scripts startTask.js bug
├── featureconfig.json           # Enables custom webpack (pcfAllowCustomWebpack)
├── DataGridControl.pcfproj      # MSBuild project for pac pcf push
├── package.js                   # Node script: copies artifacts + runs pac solution pack
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
├── models/
│   ├── GridColumn.ts            # GridColumn type definition
│   └── GridTheme.ts             # Theme helpers and default alignment by data type
└── SolutionPackage/
    ├── solution.xml             # Solution metadata (publisher, version)
    └── customizations.xml       # Solution customizations template
```

## Solution Details

| Field | Value |
|---|---|
| Namespace | `SampleNamespace` |
| Constructor | `DataGridControl` |
| Control version | `1.0.0` |
| Control type | `virtual` (Canvas app compatible) |
| Solution name | `DataGridPCFSolution` |
| Publisher | `DataGridPCFPub` (prefix: `dgp`) |
| API version | `1.3.18` |

## Tech Stack

| Package | Version | Notes |
|---|---|---|
| `pcf-scripts` | 1.51.1 | PCF build toolchain |
| `react` | 17.0.2 | Intentionally v17 — Power Apps platform provides its own React |
| `typescript` | 4.5.5 | Constrained by pcf-scripts |
| `@types/powerapps-component-framework` | 1.3.18 | Latest PCF type definitions |
