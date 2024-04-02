import {
    AdvancedDynamicTexture,
    Button,
    Control,
    TextBlock,
    Vector2WithInfo,
} from "@babylonjs/gui";

export interface Options {
    width?: number;
    height?: number;
    color?: string;
    fontSize?: number | string;
    outlineWidth?: number;
    outlineColor?: string;
    background?: string;
    left?: string;
    top?: string;
    horizontalAlignment?: number;
    verticalAlignment?: number;
    lineSpacing?: string;
    wrapping?: boolean;
    onClick?: (evt: Vector2WithInfo) => void;
}

export class UI {
    controls: Control[];
    currentControlID: number;
    menuTexture: AdvancedDynamicTexture;

    constructor(uiName: string) {
        this.currentControlID = 0;
        this.controls = [];

        this.menuTexture = AdvancedDynamicTexture.CreateFullscreenUI(uiName);
    }

    addButton(name: string, text: string, options: Options = {}) {
        const button = Button.CreateSimpleButton(name, text) as any;

        button.width = options.width || 0.5;
        button.height = options.height || "60px";
        button.color = options.color || "black";
        button.outlineWidth = options.outlineWidth || 0;
        button.outlineColor = options.outlineColor || button.color;
        button.background = options.background || "white";
        button.left = options.left || "0px";
        button.top = options.top || "0px";
        button.textHorizontalAlignment = options.horizontalAlignment
            ? options.horizontalAlignment
            : Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.textVerticalAlignment = options.verticalAlignment
            ? options.verticalAlignment
            : Control.VERTICAL_ALIGNMENT_CENTER;

        if (options.onClick) {
            button.onPointerUpObservable.add(options.onClick);
        }

        this.menuTexture.addControl(button);
        this.add(button);

        return button;
    }

    addText(text: string, options: Options = {}) {
        let textControl = new TextBlock();
        textControl.text = text;
        textControl.color = options.color || "white";
        textControl.fontSize = options.fontSize || 28;
        textControl.outlineWidth = options.outlineWidth || 0;
        textControl.outlineColor = options.outlineColor || "black";
        textControl.lineSpacing = options.lineSpacing || "5px";
        textControl.left = options.left || "0px";
        textControl.top = options.top || "0px";
        textControl.textHorizontalAlignment = options.horizontalAlignment
            ? options.horizontalAlignment
            : Control.HORIZONTAL_ALIGNMENT_CENTER;
        textControl.textVerticalAlignment = options.verticalAlignment
            ? options.verticalAlignment
            : Control.VERTICAL_ALIGNMENT_TOP;
        textControl.textWrapping = options.wrapping || true;

        this.menuTexture.addControl(textControl);
        this.add(textControl);

        return textControl;
    }

    add(control: Control) {
        (control as any).uiControlID = this.currentControlID++;
        this.controls.push(control);
    }

    remove(control: Control) {
        control.isVisible = false;
        this.controls.splice((control as any).uiControlID, 1);
    }

    show() {
        this.controls.forEach((control) => {
            control.isVisible = true;
        });
    }

    hide() {
        this.controls.forEach((control) => {
            control.isVisible = false;
        });
    }
}
