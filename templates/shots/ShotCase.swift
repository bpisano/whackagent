import XCTest

/// Base for whackagent PR screenshot tests.
/// Generated tests (`Generated/`, git-ignored) subclass it: one test method per screen state.
class ShotCase: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    /// Attaches a full-screen shot named `<screen>-<state>`.
    @MainActor
    func snap(_ name: String) {
        let shot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        shot.name = name
        shot.lifetime = .keepAlways
        add(shot)
    }

    /// On failure, attaches the app's UI tree: what was on screen instead.
    override func tearDownWithError() throws {
        guard testRun?.hasSucceeded == false else { return }
        MainActor.assumeIsolated {
            let tree = XCTAttachment(string: XCUIApplication().debugDescription)
            tree.name = "tree"
            tree.lifetime = .keepAlways
            add(tree)
        }
    }
}
