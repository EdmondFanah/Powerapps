import { IInputs, IOutputs } from './ManifestTypes';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

export class DataGridControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _notifyOutputChanged: () => void;
    private _selectedRowId: string | null = null;
    private _dirtyEditCount: number = 0;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        ReactDOM.render(
            React.createElement(App, {
                inputs: context.parameters,
                onSelectionChange: (id: string | null) => {
                    this._selectedRowId = id;
                    this._notifyOutputChanged();
                },
                onDirtyCountChange: (count: number) => {
                    this._dirtyEditCount = count;
                    this._notifyOutputChanged();
                },
            }),
            this._container
        );
    }

    public getOutputs(): IOutputs {
        return {
            SelectedRowId: this._selectedRowId ?? undefined,
            DirtyEditCount: this._dirtyEditCount,
        };
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
    }
}

