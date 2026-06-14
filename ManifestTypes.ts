/**
 * This is auto generated from the ControlManifest.Input.xml file
 */

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    // Header
    HeaderHeight: ComponentFramework.PropertyTypes.WholeNumberProperty;
    WrapHeaderText: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    HeaderHorizontalAlign: ComponentFramework.PropertyTypes.StringProperty;
    HeaderVerticalAlign: ComponentFramework.PropertyTypes.StringProperty;
    // Editing
    EnableRowSelection: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    EnableInlineEdit: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    ShowLocalSaveIndicator: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    // Column config JSON
    ColumnConfig: ComponentFramework.PropertyTypes.StringProperty;
    // Pagination
    PageSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    ShowPagination: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    // Search
    ShowSearch: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    // Appearance
    AlternateRowColor: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    PrimaryColor: ComponentFramework.PropertyTypes.StringProperty;
    FontSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    RowHeight: ComponentFramework.PropertyTypes.WholeNumberProperty;
    ShowGridLines: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    FrozenColumns: ComponentFramework.PropertyTypes.WholeNumberProperty;
    // Data as JSON string (pass JSON(yourCollection) from Canvas)
    DataJson: ComponentFramework.PropertyTypes.StringProperty;
}

export interface IOutputs {
    SelectedRowId?: string;
    DirtyEditCount?: string;
}
