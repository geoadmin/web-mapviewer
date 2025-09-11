import type { RemoveIndexSignature } from '@intlify/core-base'
import type { ComposerTranslation } from 'vue-i18n'

import type { SupportedLocales } from '@/config'

export declare type VueI18nTranslateFunction<Message> = ComposerTranslation<
    { [x: string]: Message },
    SupportedLocales,
    RemoveIndexSignature<{
        [x: string]: Message
    }>
>
