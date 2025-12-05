export declare class ErrorMessage extends Message {
}

/** @module geoadmin/log */
export declare class Message {
    msg: string;
    params: Record<string, unknown>;
    /**
     * @param msg Translation key message
     * @param params Translation params to pass to i18n (used for message formatting)
     */
    constructor(msg: string, params?: Record<string, unknown>);
    isEqual(object: Message): boolean;
}

export declare class WarningMessage extends Message {
}

export { }
