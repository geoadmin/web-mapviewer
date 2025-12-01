export enum ClickType {
    /* Any action that triggers the context menu, so for example, right click with a mouse or
    a long click with the finger on a touch device.*/
    ContextMenu = 'CONTEXT_MENU',
    /* A single click, with the left mouse button or with the finger on a touch device */
    LeftSingleClick = 'LEFT_SINGLE_CLICK',
    /* A single click with the CTRL button pressed */
    CtrlLeftSingleClick = 'CTRL_LEFT_SINGLE_CLICK',
    /* Drawing a box with ctrl and dragging a left click */
    DrawBox = 'DRAW_BOX',
}
