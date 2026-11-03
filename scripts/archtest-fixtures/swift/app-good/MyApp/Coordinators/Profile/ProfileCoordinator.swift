import SwiftUI

struct ProfileCoordinator: View {
    @State private var store: ProfileStore = .init()

    var body: some View {
        ProfileView(viewModel: UIProfileViewModel(store: store))
    }
}
