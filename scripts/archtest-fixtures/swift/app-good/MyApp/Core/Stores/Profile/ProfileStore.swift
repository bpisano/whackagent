import Observation

@MainActor
@Observable
final class ProfileStore {
    var name: String = ""
}
