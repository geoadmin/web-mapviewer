import log, { LogPreDefinedColor } from '@swissgeo/log'

import type { AppStore } from '@/store/modules/app/types'
import type { ActionDispatcher } from '@/store/types'

export default function nextState(this: AppStore, dispatcher: ActionDispatcher) {
    if (this.appState.isFulfilled()) {
        log.debug({
            title: 'App store / nextState',
            titleColor: LogPreDefinedColor.Sky,
            messages: [`Going from state ${this.appState.name} to ${this.appState.next().name}`],
        })
        this.appState = this.appState.next()
    } else {
        log.error({
            title: 'App store / nextState',
            titleColor: LogPreDefinedColor.Sky,
            messages: [
                `Cannot go to next state, current app state ${this.appState.name} is not fulfilled`,
            ],
        })
    }
}
