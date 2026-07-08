import SwiftUI

enum SeatingTheme {
    static let background = Color(red: 0.98, green: 0.96, blue: 0.93)
    static let card = Color.white
    static let ink = Color(red: 0.15, green: 0.11, blue: 0.10)
    static let muted = Color(red: 0.43, green: 0.38, blue: 0.35)
    static let accent = Color(red: 0.73, green: 0.39, blue: 0.31)
    static let accentSoft = Color(red: 0.96, green: 0.82, blue: 0.76)
    static let gold = Color(red: 0.84, green: 0.60, blue: 0.27)
}

extension View {
    func seatingCard() -> some View {
        padding(20)
            .background(SeatingTheme.card)
            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
            .shadow(color: .black.opacity(0.07), radius: 18, x: 0, y: 10)
    }
}
