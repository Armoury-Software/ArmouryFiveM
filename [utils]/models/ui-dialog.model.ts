export interface UIDialog {
    buttons: UIDialogButton[]
    content: string;
    dialogId: string;
    title: string;
}

export interface UIDialogButton {
    title: string;
}
