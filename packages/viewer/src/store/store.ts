/**
 * To better keep track of who's the "trigger" of an action, each action comes attached with the
 * name of the component (or other part of the app) that triggered the action. This will be used to
 * log things.
 */
export interface ActionDispatcher {
    name: string
}
