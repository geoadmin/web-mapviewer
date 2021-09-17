export const CHANGE_TOPIC_MUTATION = 'changeTopic'

const state = {
    config: [],
    current: null,
    tree: [],
}

const getters = {
    isDefaultTopic: (state) => {
        return state.current && state.config.length > 0 && state.current.id === 'ech'
    },
}

const actions = {
    setTopics: ({ commit, state }, topics) => {
        if (Array.isArray(topics)) {
            commit('setTopicConfig', topics)
            // if there's no current topic and topics contains the 'ech' topic, it becomes the default one
            const echTopic = topics.find((topic) => topic.id === 'ech')
            if (!state.current && echTopic) {
                commit(CHANGE_TOPIC_MUTATION, echTopic)
            }
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
}
const mutations = {
    setTopicConfig: (state, topics) => (state.config = [...topics]),
    setTopicTree: (state, tree) => (state.tree = [...tree]),
}
mutations[CHANGE_TOPIC_MUTATION] = (state, topic) => (state.current = topic)

export default {
    state,
    getters,
    actions,
    mutations,
}
