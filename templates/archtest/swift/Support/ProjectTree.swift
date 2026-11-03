import Foundation
import Harmonize

/// Paths of scanned files, relative to the project root (the folder holding `.harmonize.yaml`).
enum ProjectTree {
    static let root: URL = findRoot()

    /// Path components below the root: `["MyApp", "Models", "User.swift"]`.
    static func components(of source: SwiftSourceCode) -> [String] {
        guard let url = source.filePath else {
            return []
        }
        let path: [String] = url.resolvingSymlinksInPath().pathComponents
        let base: [String] = root.resolvingSymlinksInPath().pathComponents
        return path.starts(with: base) ? Array(path.dropFirst(base.count)) : path
    }

    /// Target folder and path inside it: `Sources/Kit/A/B.swift` → `("Kit", ["A", "B.swift"])`,
    /// `MyApp/A/B.swift` → `("MyApp", ["A", "B.swift"])`.
    static func target(of source: SwiftSourceCode) -> (name: String, inner: [String])? {
        let parts: [String] = components(of: source)
        let skip: Int = ["Sources", "Tests"].contains(parts.first) ? 1 : 0
        guard parts.count > skip + 1 else {
            return nil
        }
        return (parts[skip], Array(parts.dropFirst(skip + 1)))
    }

    /// `Base<T>` → `Base`, `Kit.Base` → `Base`.
    static func baseName(_ type: String) -> String {
        let bare: Substring = type.split(separator: "<").first ?? Substring(type)
        return String(bare.split(separator: ".").last ?? bare)
            .trimmingCharacters(in: .whitespaces)
    }

    private static func findRoot(file: String = #filePath) -> URL {
        var folder: URL = .init(fileURLWithPath: file).deletingLastPathComponent()
        while folder.path != "/" {
            if FileManager.default.fileExists(atPath: folder.appendingPathComponent(".harmonize.yaml").path) {
                return folder
            }
            folder.deleteLastPathComponent()
        }
        return folder
    }
}
