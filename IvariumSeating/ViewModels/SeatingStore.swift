import Foundation

struct SeatingPlan: Decodable {
    let event: SeatingEvent
    let tables: [SeatingTable]
    let guests: [SeatingGuest]
}

struct SeatingEvent: Decodable {
    let title: String
    let date: String
    let venue: String
    let subtitle: String?
}

struct SeatingTable: Decodable, Identifiable {
    let id: String
    let label: String
    let positionX: Double
    let positionY: Double
    let capacity: Int
}

struct SeatingGuest: Decodable, Identifiable, Hashable {
    let id: String
    let name: String
    let tableId: String
    let seatIndex: Int
}

@MainActor
final class SeatingStore: ObservableObject {
    @Published private(set) var plan: SeatingPlan?
    @Published var searchText = ""
    @Published var errorMessage: String?

    var filteredGuests: [SeatingGuest] {
        guard let plan else { return [] }
        let sortedGuests = plan.guests.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }

        guard !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return sortedGuests
        }

        return sortedGuests.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    func load() {
        guard plan == nil else { return }

        do {
            guard let url = Bundle.main.url(forResource: "seating", withExtension: "json") else {
                throw SeatingError.missingResource
            }

            let data = try Data(contentsOf: url)
            plan = try JSONDecoder().decode(SeatingPlan.self, from: data)
            errorMessage = nil
        } catch {
            errorMessage = "De seating-data kon niet worden geladen."
        }
    }

    func guest(id: String) -> SeatingGuest? {
        plan?.guests.first { $0.id == id }
    }

    func table(for guest: SeatingGuest) -> SeatingTable? {
        plan?.tables.first { $0.id == guest.tableId }
    }

    func guests(at table: SeatingTable) -> [SeatingGuest] {
        plan?.guests
            .filter { $0.tableId == table.id }
            .sorted { $0.seatIndex < $1.seatIndex } ?? []
    }
}

private enum SeatingError: Error {
    case missingResource
}
