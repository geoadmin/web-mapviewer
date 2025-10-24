import useSearchStore from '@/store/modules/search'

export default function redoSearch() {
    const searchStore = useSearchStore()

    if (searchStore.query.length > 2) {
        searchStore
            .setSearchQuery(
                searchStore.query,
                // necessary to select the first result if there is only one else it will not be because this redo search is done every time the page loaded
                { originUrlParam: true },
                { name: 'redoSearchWhenNeeded' }
            )
    }
}