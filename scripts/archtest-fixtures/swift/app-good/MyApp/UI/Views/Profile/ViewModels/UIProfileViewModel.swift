import Observation

@Observable
final class UIProfileViewModel: ProfileViewModel {
    private let store: ProfileStore

    var name: String { store.name }

    init(store: ProfileStore) {
        self.store = store
    }
}
