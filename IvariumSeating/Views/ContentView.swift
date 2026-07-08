import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: SeatingStore

    var body: some View {
        NavigationStack {
            Group {
                if let plan = store.plan {
                    GuestPickerView(plan: plan)
                } else if let errorMessage = store.errorMessage {
                    ErrorStateView(message: errorMessage)
                } else {
                    ProgressView("Seating laden...")
                }
            }
            .background(SeatingTheme.background.ignoresSafeArea())
            .navigationDestination(for: String.self) { guestID in
                if let guest = store.guest(id: guestID), let plan = store.plan {
                    SeatDetailView(plan: plan, guest: guest)
                } else {
                    ErrorStateView(message: "Deze gast kon niet worden gevonden.")
                }
            }
        }
        .tint(SeatingTheme.accent)
    }
}

private struct GuestPickerView: View {
    @EnvironmentObject private var store: SeatingStore
    let plan: SeatingPlan

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                EventHeaderView(event: plan.event)

                VStack(alignment: .leading, spacing: 14) {
                    Text("Zoek jouw naam")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(SeatingTheme.ink)

                    TextField("Typ je naam", text: $store.searchText)
                        .textInputAutocapitalization(.words)
                        .autocorrectionDisabled()
                        .padding(16)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(SeatingTheme.accentSoft, lineWidth: 1)
                        )

                    LazyVStack(spacing: 10) {
                        ForEach(store.filteredGuests) { guest in
                            NavigationLink(value: guest.id) {
                                GuestRowView(guest: guest, table: store.table(for: guest))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .seatingCard()
            }
            .padding()
        }
        .navigationTitle("Ivarium Seating")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct SeatDetailView: View {
    @EnvironmentObject private var store: SeatingStore
    let plan: SeatingPlan
    let guest: SeatingGuest

    private var table: SeatingTable? {
        store.table(for: guest)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                EventHeaderView(event: plan.event)

                VStack(alignment: .leading, spacing: 12) {
                    Text("Jouw plek")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(SeatingTheme.ink)

                    Text(guest.name)
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(SeatingTheme.ink)

                    if let table {
                        HStack(spacing: 12) {
                            Label(table.label, systemImage: "tablecells")
                            Label("Stoel \(guest.seatIndex + 1)", systemImage: "chair")
                        }
                        .font(.headline)
                        .foregroundStyle(SeatingTheme.accent)
                    }
                }
                .seatingCard()

                if let table {
                    TableSeatMapView(table: table, guests: store.guests(at: table), highlightedGuest: guest)
                        .seatingCard()
                }

                FloorPlanView(tables: plan.tables, selectedTableID: guest.tableId)
                    .frame(height: 360)
                    .seatingCard()
            }
            .padding()
        }
        .background(SeatingTheme.background.ignoresSafeArea())
        .navigationTitle(table?.label ?? "Plek")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct EventHeaderView: View {
    let event: SeatingEvent

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(event.title)
                .font(.system(.largeTitle, design: .serif).weight(.bold))
                .foregroundStyle(SeatingTheme.ink)

            Text(event.subtitle ?? "Welkom")
                .font(.headline)
                .foregroundStyle(SeatingTheme.accent)

            HStack(spacing: 14) {
                Label(event.venue, systemImage: "mappin.and.ellipse")
                Label(event.date, systemImage: "calendar")
            }
            .font(.subheadline)
            .foregroundStyle(SeatingTheme.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .seatingCard()
    }
}

private struct GuestRowView: View {
    let guest: SeatingGuest
    let table: SeatingTable?

    var body: some View {
        HStack(spacing: 14) {
            Text(initials(for: guest.name))
                .font(.headline.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 48, height: 48)
                .background(SeatingTheme.accent)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(guest.name)
                    .font(.headline)
                    .foregroundStyle(SeatingTheme.ink)

                Text(table?.label ?? "Tafel onbekend")
                    .font(.subheadline)
                    .foregroundStyle(SeatingTheme.muted)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption.weight(.bold))
                .foregroundStyle(SeatingTheme.accent)
        }
        .padding(14)
        .background(SeatingTheme.background)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct FloorPlanView: View {
    let tables: [SeatingTable]
    let selectedTableID: String

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Zaaloverzicht")
                .font(.title3.weight(.semibold))
                .foregroundStyle(SeatingTheme.ink)

            GeometryReader { proxy in
                ZStack {
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .fill(LinearGradient(colors: [Color.white, SeatingTheme.background], startPoint: .top, endPoint: .bottom))
                        .overlay(
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .stroke(SeatingTheme.accentSoft, lineWidth: 1)
                        )

                    ForEach(tables) { table in
                        let isSelected = table.id == selectedTableID

                        VStack(spacing: 6) {
                            Circle()
                                .fill(isSelected ? SeatingTheme.accent : Color.white)
                                .overlay(Circle().stroke(isSelected ? SeatingTheme.gold : SeatingTheme.accentSoft, lineWidth: isSelected ? 4 : 2))
                                .frame(width: isSelected ? 68 : 56, height: isSelected ? 68 : 56)
                                .shadow(color: isSelected ? SeatingTheme.accent.opacity(0.35) : .clear, radius: 12)

                            Text(table.label)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(isSelected ? SeatingTheme.accent : SeatingTheme.muted)
                        }
                        .position(
                            x: proxy.size.width * table.positionX / 100,
                            y: proxy.size.height * table.positionY / 100
                        )
                    }
                }
            }
        }
    }
}

private struct TableSeatMapView: View {
    let table: SeatingTable
    let guests: [SeatingGuest]
    let highlightedGuest: SeatingGuest

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Tafelindeling")
                .font(.title3.weight(.semibold))
                .foregroundStyle(SeatingTheme.ink)

            GeometryReader { proxy in
                ZStack {
                    Circle()
                        .fill(SeatingTheme.accentSoft.opacity(0.45))
                        .frame(width: min(proxy.size.width, proxy.size.height) * 0.42)

                    Text(table.label)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(SeatingTheme.ink)

                    ForEach(0..<max(table.capacity, 1), id: \.self) { index in
                        let guest = guests.first { $0.seatIndex == index }
                        let isHighlighted = guest?.id == highlightedGuest.id
                        let point = seatPoint(index: index, capacity: table.capacity, size: proxy.size)

                        VStack(spacing: 3) {
                            Text(guest.map { initials(for: $0.name) } ?? "\(index + 1)")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(isHighlighted ? .white : SeatingTheme.ink)
                                .frame(width: 44, height: 44)
                                .background(isHighlighted ? SeatingTheme.accent : Color.white)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(isHighlighted ? SeatingTheme.gold : SeatingTheme.accentSoft, lineWidth: 2))

                            if isHighlighted {
                                Text("JIJ")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(SeatingTheme.accent)
                            }
                        }
                        .position(point)
                    }
                }
            }
            .frame(height: 320)
        }
    }
}

private struct ErrorStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundStyle(SeatingTheme.accent)
            Text(message)
                .font(.headline)
                .multilineTextAlignment(.center)
                .foregroundStyle(SeatingTheme.ink)
        }
        .padding()
    }
}

private func initials(for name: String) -> String {
    let parts = name.split(separator: " ")
    return parts.prefix(2).compactMap(\.first).map(String.init).joined().uppercased()
}

private func seatPoint(index: Int, capacity: Int, size: CGSize) -> CGPoint {
    let usableSize = min(size.width, size.height)
    let radius = usableSize * 0.38
    let angle = (Double(index) / Double(max(capacity, 1)) * Double.pi * 2) - Double.pi / 2
    return CGPoint(
        x: size.width / 2 + CGFloat(cos(angle)) * radius,
        y: size.height / 2 + CGFloat(sin(angle)) * radius
    )
}

#Preview {
    ContentView()
        .environmentObject(SeatingStore())
}
