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
    setTopics: ({ commit }, { topics, dispatcher }) => {
        commit('setTopics', { topics, dispatcher })
    },
    setTopicTree: ({ commit }, { layers, dispatcher }) => {
        commit('setTopicTree', { layers: layers.map((layer) => layer.clone()), dispatcher })
    },
    changeTopic: ({ commit }, args) => {
        commit(CHANGE_TOPIC_MUTATION, args)
    },
    setTopicById: ({ commit, state }, { value, dispatcher }) => {
        const topicId = value
        const topic = state.config.find((topic) => topic.id === topicId)
        if (topic) {
            commit(CHANGE_TOPIC_MUTATION, { value: topic, dispatcher })
        } else {
            log.error('No topic found with ID', topicId)
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
}
mutations[CHANGE_TOPIC_MUTATION] = (state, { value }) => (state.current = value)

export default {
    state,
    getters,
    actions,
    mutations,
}
