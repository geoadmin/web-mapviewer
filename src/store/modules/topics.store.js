import log from '@/utils/logging'

export const CHANGE_TOPIC_MUTATION = 'changeTopic'

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
    current: null,
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
        return state.current && state.current.id === 'ech'
    },
    /** Returns the current topic's id, or `ech` if no topic is selected */
    currentTopicId: (state) => {
        if (state.current) {
            return state.current.id
        }
        return 'ech'
    },
}

const actions = {
    setTopics: ({ commit }, topics) => {
        if (Array.isArray(topics)) {
            commit('setTopicConfig', topics)
        }
    },
    setTopicTree: ({ commit }, tree) => {
        if (Array.isArray(tree)) {
            commit('setTopicTree', tree)
        }
    },
    changeTopic: ({ commit }, topic) => {
        commit(CHANGE_TOPIC_MUTATION, topic)
    },
    setTopicById: ({ commit, state }, topicId) => {
        const topic = state.config.find((topic) => topic.id === topicId)
        if (topic) {
            commit(CHANGE_TOPIC_MUTATION, topic)
        } else {
            log.error('No topic found with ID', topicId)
        }
    },
    setTopicTreeOpenedThemesIds: ({ commit }, themes) => {
        if (typeof themes === 'string') {
            commit('setTopicTreeOpenedThemesIds', themes.split(','))
        } else if (Array.isArray(themes)) {
            commit('setTopicTreeOpenedThemesIds', themes)
        }
    },
}
const mutations = {
    setTopicConfig: (state, topics) => (state.config = [...topics]),
    setTopicTree: (state, tree) => (state.tree = [...tree]),
    setTopicTreeOpenedThemesIds: (state, themesIds) => (state.openedTreeThemesIds = [...themesIds]),
}
mutations[CHANGE_TOPIC_MUTATION] = (state, topic) => (state.current = topic)

export default {
    state,
    getters,
    actions,
    mutations,
}
