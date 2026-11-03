import SwiftUI

struct ProfileView<ViewModel: ProfileViewModel>: View {
    let viewModel: ViewModel
    @State private var isEditing: Bool = false

    var body: some View {
        Text(viewModel.name)
    }
}

private extension ProfileView {
    enum Layout {
        static let padding: Double = 16
    }
}

#Preview {
    ProfileView(viewModel: MockProfileViewModel())
}
