import log from '@/utils/logging'

const state = {
    /**
     * List of all available topics
     *
     * @type {Topic[]}
     */
    config: [],
    /**
     * Current topic (either default 'ech' at app startup, or another from the config later chosen
     * by the user)
     *
     * @type {Topic}
     */
    current: 'ech',
    /**
     * Current topic's layers tree (that will help the user select layers belonging to this topic)
     *
     * @type {GeoAdminLayer[]}
     */
    tree: [],
    /**
     * The ids of the catalog nodes that should be open.
     *
     * @type {String[]}
     */
    openedTreeThemesIds: [],
}

const getters = {
    isDefaultTopic: (state) => {
        return state.current === 'ech'
    },
    /** Returns the current topic's id, or `ech` if no topic is selected */
    currentTopicId: (state) => {
        return state.current
    },
    currentTopic: (state) => {
        return state.config.find((topic) => topic.id === state.current)
    },
}

const actions = {
    setTopics: ({ commit }, { topics, dispatcher }) => {
        commit('setTopics', { topics, dispatcher })
    },
    setTopicTree: ({ commit }, { layers, dispatcher }) => {
        commit('setTopicTree', { layers: layers.map((layer) => layer.clone()), dispatcher })
    },
    changeTopic: ({ commit, state }, { value, dispatcher }) => {
        if (
            state.config.find((topic) => topic.id === value) ||
            // during appLoadingManagement.routerPlugin the topics are not yet set
            // therefore we cannot validate the topic ID
            dispatcher === 'appLoadingManagement.routerPlugin'
        ) {
            commit('changeTopic', { value, dispatcher })
        } else {
            log.error(`Invalid topic ID ${value}`)
        }
    },
    setTopicTreeOpenedThemesIds: ({ commit }, { value, dispatcher }) => {
        if (typeof value === 'string') {
            commit('setTopicTreeOpenedThemesIds', {
                themes: value.indexOf(',') !== -1 ? value.split(',') : [value],
                dispatcher,
            })
        } else if (Array.isArray(value)) {
            commit('setTopicTreeOpenedThemesIds', { themes: value.slice(), dispatcher })
        }
    },
}
const mutations = {
    setTopics: (state, { topics }) => (state.config = topics),
    setTopicTree: (state, { layers }) => (state.tree = layers),
    setTopicTreeOpenedThemesIds: (state, { themes }) => (state.openedTreeThemesIds = themes),
    changeTopic: (state, { value }) => (state.current = value),
}

export default {
    state,
    getters,
    actions,
    mutations,
}
