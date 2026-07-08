import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: SeatingStore
    @State private var selectedTab: SeatingTab = .home

    var body: some View {
        NavigationStack {
            Group {
                if let plan = store.plan {
                    TabView(selection: $selectedTab) {
                        HomeView(plan: plan, selectedTab: $selectedTab)
                            .tag(SeatingTab.home)
                            .tabItem {
                                Label("Home", systemImage: "house.fill")
                            }

                        TablePlanScreenView(plan: plan)
                            .tag(SeatingTab.tablePlan)
                            .tabItem {
                                Label("Tafelplan", systemImage: "square.grid.3x3")
                            }

                        InfoScreenView(event: plan.event)
                            .tag(SeatingTab.info)
                            .tabItem {
                                Label("Info", systemImage: "info.bubble")
                            }
                    }
                    .toolbarBackground(.white, for: .tabBar)
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

private enum SeatingTab {
    case home
    case tablePlan
    case info
}

private struct HomeView: View {
    let plan: SeatingPlan
    @Binding var selectedTab: SeatingTab
    @State private var showsScannerMessage = false

    var body: some View {
        GeometryReader { proxy in
            let height = proxy.size.height
            let scale = min(max(height / 780, 0.72), 1.0)

            ZStack {
                WeddingHeroBackgroundView()

                VStack(spacing: 0) {
                    Spacer(minLength: 42 * scale)

                    SeatingLogoView(scale: scale)

                    Spacer(minLength: 24 * scale)

                    VStack(spacing: 5 * scale) {
                        Text("Welkom bij onze")
                            .font(.system(size: 34 * scale, weight: .regular, design: .serif))
                        Text("bruiloft")
                            .font(.system(size: 92 * scale, weight: .regular, design: .serif))
                            .italic()
                            .minimumScaleFactor(0.65)
                            .lineLimit(1)
                    }
                    .foregroundStyle(.white)
                    .shadow(color: .black.opacity(0.25), radius: 12, y: 6)

                    WeddingDividerView(scale: scale)
                        .padding(.top, 18 * scale)

                    Text("Fijn dat je er bent!\nScan de QR-code of zoek\nje naam op om te zien waar\nje plaatsneemt.")
                        .font(.system(size: 28 * scale, weight: .regular, design: .serif))
                        .lineSpacing(8 * scale)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.2), radius: 8, y: 4)
                        .padding(.horizontal, 26)
                        .padding(.top, 22 * scale)

                    Spacer(minLength: max(12, 22 * scale))

                    VStack(spacing: 18 * scale) {
                        Button {
                            showsScannerMessage = true
                        } label: {
                            Label("QR-code scannen", systemImage: "qrcode.viewfinder")
                                .font(.system(size: 22 * scale, weight: .semibold))
                                .textCase(.uppercase)
                                .tracking(4 * scale)
                                .frame(maxWidth: .infinity)
                                .frame(height: 76 * scale)
                        }
                        .buttonStyle(GoldCapsuleButtonStyle())

                        HStack(spacing: 22 * scale) {
                            Rectangle()
                                .fill(SeatingTheme.gold.opacity(0.7))
                                .frame(height: 1)
                            Text("OF")
                                .font(.system(size: 21 * scale, weight: .medium, design: .serif))
                                .foregroundStyle(SeatingTheme.gold)
                            Rectangle()
                                .fill(SeatingTheme.gold.opacity(0.7))
                                .frame(height: 1)
                        }

                        NavigationLink {
                            GuestPickerView(plan: plan)
                        } label: {
                            Label("Zoek op naam", systemImage: "magnifyingglass")
                                .font(.system(size: 24 * scale, weight: .semibold))
                                .textCase(.uppercase)
                                .tracking(4 * scale)
                                .foregroundStyle(SeatingTheme.gold)
                                .frame(maxWidth: .infinity)
                                .frame(height: 76 * scale)
                        }
                        .buttonStyle(WhiteCapsuleButtonStyle())
                    }
                    .padding(.horizontal, 28)

                    Spacer(minLength: max(10, 20 * scale))

                    Button {
                        selectedTab = .tablePlan
                    } label: {
                        HStack(spacing: 16 * scale) {
                            Rectangle()
                                .fill(SeatingTheme.gold.opacity(0.7))
                                .frame(width: 86 * scale, height: 1)
                            Text("Bekijk het tafelplan")
                                .font(.system(size: 25 * scale, weight: .regular, design: .serif))
                            Image(systemName: "arrow.right")
                                .font(.system(size: 21 * scale))
                        }
                        .foregroundStyle(.white)
                    }

                    Spacer(minLength: max(10, 22 * scale))
                }
                .frame(width: proxy.size.width, height: proxy.size.height)
            }
        }
        .clipped()
        .ignoresSafeArea(edges: .top)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .navigationBar)
        .alert("QR-scanner", isPresented: $showsScannerMessage) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("De QR-scanner kan hier aan de camera-flow gekoppeld worden.")
        }
    }
}

private struct TablePlanScreenView: View {
    let plan: SeatingPlan

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                EventHeaderView(event: plan.event)

                FloorPlanView(tables: plan.tables, selectedTableID: nil)
                    .frame(height: 420)
                    .seatingCard()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Alle tafels")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(SeatingTheme.ink)

                    ForEach(plan.tables) { table in
                        HStack {
                            Text(table.label)
                                .font(.headline)
                            Spacer()
                            Text("\(table.capacity) plaatsen")
                                .foregroundStyle(SeatingTheme.muted)
                        }
                        .padding(.vertical, 10)
                        .overlay(alignment: .bottom) {
                            Rectangle()
                                .fill(SeatingTheme.accentSoft.opacity(0.6))
                                .frame(height: 1)
                        }
                    }
                }
                .seatingCard()
            }
            .padding()
        }
        .background(SeatingTheme.background.ignoresSafeArea())
        .navigationTitle("Tafelplan")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct InfoScreenView: View {
    let event: SeatingEvent

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                EventHeaderView(event: event)

                VStack(alignment: .leading, spacing: 14) {
                    Text("Hoe werkt het?")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(SeatingTheme.ink)

                    InfoRowView(icon: "qrcode.viewfinder", title: "Scan je QR-code", text: "Open direct jouw persoonlijke tafel en stoel.")
                    InfoRowView(icon: "magnifyingglass", title: "Zoek op naam", text: "Geen QR-code bij de hand? Zoek je naam op in de gastenlijst.")
                    InfoRowView(icon: "square.grid.3x3", title: "Bekijk het tafelplan", text: "Zie waar alle tafels in de zaal staan.")
                }
                .seatingCard()
            }
            .padding()
        }
        .background(SeatingTheme.background.ignoresSafeArea())
        .navigationTitle("Info")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct InfoRowView: View {
    let icon: String
    let title: String
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.title3.weight(.semibold))
                .foregroundStyle(SeatingTheme.accent)
                .frame(width: 36, height: 36)
                .background(SeatingTheme.accentSoft.opacity(0.5))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(SeatingTheme.ink)
                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(SeatingTheme.muted)
            }
        }
    }
}

private struct SeatingLogoView: View {
    let scale: CGFloat

    var body: some View {
        VStack(spacing: 11 * scale) {
            Image(systemName: "heart")
                .font(.system(size: 82 * scale, weight: .ultraLight))
                .foregroundStyle(SeatingTheme.gold)

            Text("SEATINGAPP")
                .font(.system(size: 41 * scale, weight: .light))
                .tracking(13 * scale)
                .foregroundStyle(.white)
                .minimumScaleFactor(0.65)
                .lineLimit(1)

            HStack(spacing: 16 * scale) {
                Rectangle()
                    .fill(SeatingTheme.gold.opacity(0.8))
                    .frame(width: 86 * scale, height: 1)
                Text("by ivarium")
                    .font(.system(size: 24 * scale, weight: .light))
                    .tracking(7 * scale)
                    .foregroundStyle(SeatingTheme.gold)
                Rectangle()
                    .fill(SeatingTheme.gold.opacity(0.8))
                    .frame(width: 86 * scale, height: 1)
            }
        }
        .padding(.horizontal, 18)
    }
}

private struct WeddingDividerView: View {
    let scale: CGFloat

    var body: some View {
        HStack(spacing: 20 * scale) {
            Rectangle()
                .fill(SeatingTheme.gold.opacity(0.8))
                .frame(width: 118 * scale, height: 1)
            Image(systemName: "heart.fill")
                .font(.system(size: 27 * scale))
                .foregroundStyle(SeatingTheme.gold)
            Rectangle()
                .fill(SeatingTheme.gold.opacity(0.8))
                .frame(width: 118 * scale, height: 1)
        }
    }
}

private struct WeddingHeroBackgroundView: View {
    var body: some View {
        ZStack {
            Image("WeddingHeroBackground")
                .resizable()
                .scaledToFill()
                .saturation(0.92)
                .blur(radius: 0.9)

            LinearGradient(
                colors: [.black.opacity(0.24), .black.opacity(0.42), .black.opacity(0.34)],
                startPoint: .top,
                endPoint: .bottom
            )

            RadialGradient(
                colors: [.clear, .black.opacity(0.26)],
                center: .center,
                startRadius: 120,
                endRadius: 520
            )
        }
    }
}

private struct GoldCapsuleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(.white)
            .background(
                LinearGradient(
                    colors: [
                        SeatingTheme.gold.opacity(configuration.isPressed ? 0.82 : 1),
                        Color(red: 0.91, green: 0.68, blue: 0.40).opacity(configuration.isPressed ? 0.82 : 1)
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.18), radius: 16, y: 10)
    }
}

private struct WhiteCapsuleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(Color.white.opacity(configuration.isPressed ? 0.88 : 0.98))
            .clipShape(Capsule())
            .shadow(color: .black.opacity(0.18), radius: 16, y: 10)
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
    let selectedTableID: String?

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
