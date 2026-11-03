import Testing

/// Legacy violations frozen at setup, per rule id: type names (file names for file rules).
/// Written by /wa-setup and /wa-update only. Agents may only delete a stale entry.
/// Shrinks, never grows: an entry that now passes, or matches nothing, fails the run.
enum ArchBaseline {
    static let entries: [String: [String]] = [:]

    static func names(_ ruleID: String) -> [String] {
        entries[ruleID] ?? []
    }

    /// Splits a rule's entries across its assertions (classes, structs…), one share per collection.
    /// An entry no collection holds is stale: recorded as an issue.
    static func split(_ ruleID: String, among collections: [[String]]) -> [[String]] {
        let all: [String] = names(ruleID)
        let known: Set<String> = .init(collections.joined())
        for entry in all where !known.contains(entry) {
            Issue.record("Stale baseline entry `\(entry)` for \(ruleID): matches nothing. Delete it.")
        }
        return collections.map { names in all.filter(Set(names).contains) }
    }
}
