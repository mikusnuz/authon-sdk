import SwiftUI

// MARK: - AuthonTheme

public struct AuthonTheme: Sendable {
    public let primaryColor: Color
    public let primaryGradient: LinearGradient
    public let backgroundColor: Color
    public let textColor: Color
    public let secondaryTextColor: Color
    public let borderRadius: CGFloat
    public let logoDataUrl: String?

    public init(branding: BrandingConfig, colorScheme: ColorScheme) {
        let startHex = branding.primaryColorStart ?? "#7c3aed"
        let endHex = branding.primaryColorEnd ?? "#4f46e5"

        self.primaryColor = Color(hex: startHex)
        self.primaryGradient = LinearGradient(
            colors: [Color(hex: startHex), Color(hex: endHex)],
            startPoint: .leading,
            endPoint: .trailing
        )

        if colorScheme == .dark {
            self.backgroundColor = Color(hex: branding.darkBg ?? "#0f172a")
            self.textColor = Color(hex: branding.darkText ?? "#f1f5f9")
            self.secondaryTextColor = Color(hex: branding.darkText ?? "#f1f5f9").opacity(0.6)
        } else {
            self.backgroundColor = Color(hex: branding.lightBg ?? "#ffffff")
            self.textColor = Color(hex: branding.lightText ?? "#111827")
            self.secondaryTextColor = Color(hex: branding.lightText ?? "#111827").opacity(0.5)
        }

        self.borderRadius = CGFloat(branding.borderRadius ?? 12)
        self.logoDataUrl = branding.logoDataUrl
    }

    public static let `default` = AuthonTheme(branding: .default, colorScheme: .light)
}

// MARK: - Color+Hex

extension Color {
    public init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        let hexString = cleaned.hasPrefix("#") ? String(cleaned.dropFirst()) : cleaned

        var rgbValue: UInt64 = 0
        Scanner(string: hexString).scanHexInt64(&rgbValue)

        let length = hexString.count
        if length == 8 {
            // RRGGBBAA
            let r = Double((rgbValue >> 24) & 0xFF) / 255.0
            let g = Double((rgbValue >> 16) & 0xFF) / 255.0
            let b = Double((rgbValue >> 8) & 0xFF) / 255.0
            let a = Double(rgbValue & 0xFF) / 255.0
            self.init(red: r, green: g, blue: b, opacity: a)
        } else {
            // RRGGBB
            let r = Double((rgbValue >> 16) & 0xFF) / 255.0
            let g = Double((rgbValue >> 8) & 0xFF) / 255.0
            let b = Double(rgbValue & 0xFF) / 255.0
            self.init(red: r, green: g, blue: b)
        }
    }
}
