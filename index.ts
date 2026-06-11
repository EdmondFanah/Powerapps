import { IInputs, IOutputs } from './ManifestTypes';
import * as React from 'react';
import { App } from './App';

export class DataGridControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _selectedRowId: string | null = null;
    private _dirtyEditCount: number = 0;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
        context.parameters.sampleDataSet.paging.setPageSize(500);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        return React.createElement(App, {
            inputs: context.parameters,
            onSelectionChange: (id: string | null) => {
                this._selectedRowId = id;
                this._notifyOutputChanged();
            },
            onDirtyCountChange: (count: number) => {
                this._dirtyEditCount = count;
                this._notifyOutputChanged();
            },
        });
    }

    public getOutputs(): IOutputs {
        return {
            SelectedRowId: this._selectedRowId ?? undefined,
            DirtyEditCount: this._dirtyEditCount,
        };
    }

    public destroy(): void {
        // no-op: platform manages React lifecycle for virtual controls
    }
}
