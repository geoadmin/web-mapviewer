export enum ClickType {
    /* Any action that triggers the context menu, so for example, right click with a mouse or
    a long click with the finger on a touch device.*/
    ContextMenu = 'ContextMenu',
    /* A single click, with the left mouse button or with the finger on a touch device */
    LeftSingleClick = 'LEFT_SINGLECLICK',
    /* A single click with the CTRL button pressed */
    CtrlLeftSingleClick = 'CTRL_LEFT_SINGLECLICK',
    /* Drawing a box with ctrl and dragging a left click */
    DrawBox = 'DRAW_BOX',
}