import SwiftUI

@main
struct IvariumSeatingApp: App {
    @StateObject private var store = SeatingStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .task {
                    store.load()
                }
        }
    }
}
