import SwiftUI

// MARK: - ProviderIcon

struct ProviderIcon: View {
    let provider: OAuthProvider
    let size: CGFloat

    init(provider: OAuthProvider, size: CGFloat = 20) {
        self.provider = provider
        self.size = size
    }

    var body: some View {
        Group {
            switch provider {
            case .google:
                GoogleIcon(size: size)
            case .apple:
                Image(systemName: "apple.logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
            case .github:
                GitHubIcon(size: size)
            case .facebook:
                FacebookIcon(size: size)
            case .discord:
                DiscordIcon(size: size)
            case .microsoft:
                MicrosoftIcon(size: size)
            case .x:
                XIcon(size: size)
            default:
                ProviderLetterIcon(provider: provider, size: size)
            }
        }
    }
}

// MARK: - Google Icon (Official 4-color G)

private struct GoogleIcon: View {
    let size: CGFloat

    var body: some View {
        Canvas { context, canvasSize in
            let s = canvasSize.width / 24

            // Blue section (right arc + bar)
            var blue = Path()
            blue.move(to: CGPoint(x: 23.0 * s, y: 12.27 * s))
            blue.addCurve(to: CGPoint(x: 22.68 * s, y: 10.7 * s), control1: CGPoint(x: 23.0 * s, y: 11.73 * s), control2: CGPoint(x: 22.88 * s, y: 11.22 * s))
            blue.addLine(to: CGPoint(x: 12.24 * s, y: 10.7 * s))
            blue.addLine(to: CGPoint(x: 12.24 * s, y: 13.76 * s))
            blue.addLine(to: CGPoint(x: 18.45 * s, y: 13.76 * s))
            blue.addCurve(to: CGPoint(x: 16.75 * s, y: 16.77 * s), control1: CGPoint(x: 18.12 * s, y: 15.18 * s), control2: CGPoint(x: 17.56 * s, y: 16.15 * s))
            blue.addLine(to: CGPoint(x: 19.22 * s, y: 18.68 * s))
            blue.addCurve(to: CGPoint(x: 23.0 * s, y: 12.27 * s), control1: CGPoint(x: 21.46 * s, y: 16.72 * s), control2: CGPoint(x: 23.0 * s, y: 14.66 * s))
            blue.closeSubpath()
            context.fill(blue, with: .color(Color(hex: "#4285F4")))

            // Green section (bottom-right)
            var green = Path()
            green.move(to: CGPoint(x: 12.24 * s, y: 22.5 * s))
            green.addCurve(to: CGPoint(x: 19.22 * s, y: 18.68 * s), control1: CGPoint(x: 15.32 * s, y: 22.5 * s), control2: CGPoint(x: 17.78 * s, y: 20.97 * s))
            green.addLine(to: CGPoint(x: 16.75 * s, y: 16.77 * s))
            green.addCurve(to: CGPoint(x: 12.24 * s, y: 18.5 * s), control1: CGPoint(x: 15.66 * s, y: 17.62 * s), control2: CGPoint(x: 14.04 * s, y: 18.5 * s))
            green.addCurve(to: CGPoint(x: 6.01 * s, y: 14.76 * s), control1: CGPoint(x: 9.37 * s, y: 18.5 * s), control2: CGPoint(x: 6.92 * s, y: 17.01 * s))
            green.addLine(to: CGPoint(x: 3.47 * s, y: 16.63 * s))
            green.addCurve(to: CGPoint(x: 12.24 * s, y: 22.5 * s), control1: CGPoint(x: 5.06 * s, y: 19.94 * s), control2: CGPoint(x: 8.39 * s, y: 22.5 * s))
            green.closeSubpath()
            context.fill(green, with: .color(Color(hex: "#34A853")))

            // Yellow section (bottom-left)
            var yellow = Path()
            yellow.move(to: CGPoint(x: 6.01 * s, y: 14.76 * s))
            yellow.addCurve(to: CGPoint(x: 5.58 * s, y: 12.25 * s), control1: CGPoint(x: 5.68 * s, y: 13.98 * s), control2: CGPoint(x: 5.5 * s, y: 13.14 * s))
            yellow.addCurve(to: CGPoint(x: 6.01 * s, y: 9.74 * s), control1: CGPoint(x: 5.58 * s, y: 11.36 * s), control2: CGPoint(x: 5.74 * s, y: 10.52 * s))
            yellow.addLine(to: CGPoint(x: 3.47 * s, y: 7.87 * s))
            yellow.addCurve(to: CGPoint(x: 1.5 * s, y: 12.25 * s), control1: CGPoint(x: 2.28 * s, y: 9.18 * s), control2: CGPoint(x: 1.5 * s, y: 10.66 * s))
            yellow.addCurve(to: CGPoint(x: 3.47 * s, y: 16.63 * s), control1: CGPoint(x: 1.5 * s, y: 13.84 * s), control2: CGPoint(x: 2.28 * s, y: 15.32 * s))
            yellow.addLine(to: CGPoint(x: 6.01 * s, y: 14.76 * s))
            yellow.closeSubpath()
            context.fill(yellow, with: .color(Color(hex: "#FBBC05")))

            // Red section (top-left)
            var red = Path()
            red.move(to: CGPoint(x: 12.24 * s, y: 6.0 * s))
            red.addCurve(to: CGPoint(x: 17.18 * s, y: 7.91 * s), control1: CGPoint(x: 14.2 * s, y: 6.0 * s), control2: CGPoint(x: 15.91 * s, y: 6.72 * s))
            red.addLine(to: CGPoint(x: 19.79 * s, y: 5.36 * s))
            red.addCurve(to: CGPoint(x: 12.24 * s, y: 2.0 * s), control1: CGPoint(x: 17.87 * s, y: 3.56 * s), control2: CGPoint(x: 15.22 * s, y: 2.0 * s))
            red.addCurve(to: CGPoint(x: 3.47 * s, y: 7.87 * s), control1: CGPoint(x: 8.39 * s, y: 2.0 * s), control2: CGPoint(x: 5.06 * s, y: 4.56 * s))
            red.addLine(to: CGPoint(x: 6.01 * s, y: 9.74 * s))
            red.addCurve(to: CGPoint(x: 12.24 * s, y: 6.0 * s), control1: CGPoint(x: 6.92 * s, y: 7.49 * s), control2: CGPoint(x: 9.37 * s, y: 6.0 * s))
            red.closeSubpath()
            context.fill(red, with: .color(Color(hex: "#EA4335")))
        }
        .frame(width: size, height: size)
    }
}

// MARK: - GitHub Icon

private struct GitHubIcon: View {
    let size: CGFloat

    var body: some View {
        Canvas { context, canvasSize in
            let scale = canvasSize.width / 24
            var path = Path()
            path.move(to: CGPoint(x: 12 * scale, y: 0.3 * scale))
            path.addCurve(
                to: CGPoint(x: 0 * scale, y: 12.3 * scale),
                control1: CGPoint(x: 5.4 * scale, y: 0.3 * scale),
                control2: CGPoint(x: 0 * scale, y: 5.7 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 8.2 * scale, y: 23.6 * scale),
                control1: CGPoint(x: 0 * scale, y: 17.6 * scale),
                control2: CGPoint(x: 3.4 * scale, y: 22.3 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 8 * scale, y: 21.6 * scale),
                control1: CGPoint(x: 8.8 * scale, y: 23.7 * scale),
                control2: CGPoint(x: 8 * scale, y: 22.8 * scale)
            )
            path.addLine(to: CGPoint(x: 8 * scale, y: 19.3 * scale))
            path.addCurve(
                to: CGPoint(x: 3.6 * scale, y: 17.8 * scale),
                control1: CGPoint(x: 5 * scale, y: 19.9 * scale),
                control2: CGPoint(x: 3.6 * scale, y: 19.6 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 4.5 * scale, y: 15.8 * scale),
                control1: CGPoint(x: 3.6 * scale, y: 17 * scale),
                control2: CGPoint(x: 3.9 * scale, y: 16.3 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 7 * scale, y: 14.3 * scale),
                control1: CGPoint(x: 4.5 * scale, y: 15.1 * scale),
                control2: CGPoint(x: 5.2 * scale, y: 14.3 * scale)
            )
            path.addLine(to: CGPoint(x: 7.3 * scale, y: 14.3 * scale))
            path.addCurve(
                to: CGPoint(x: 5.8 * scale, y: 11.2 * scale),
                control1: CGPoint(x: 6.1 * scale, y: 13.7 * scale),
                control2: CGPoint(x: 5.5 * scale, y: 12.6 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 6.5 * scale, y: 7.8 * scale),
                control1: CGPoint(x: 6.1 * scale, y: 9.8 * scale),
                control2: CGPoint(x: 6.5 * scale, y: 7.8 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 10 * scale, y: 8.8 * scale),
                control1: CGPoint(x: 6.5 * scale, y: 7.8 * scale),
                control2: CGPoint(x: 8.2 * scale, y: 7.6 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 14 * scale, y: 8.8 * scale),
                control1: CGPoint(x: 11.2 * scale, y: 8.5 * scale),
                control2: CGPoint(x: 12.8 * scale, y: 8.5 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 17.5 * scale, y: 7.8 * scale),
                control1: CGPoint(x: 15.8 * scale, y: 7.6 * scale),
                control2: CGPoint(x: 17.5 * scale, y: 7.8 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 18.2 * scale, y: 11.2 * scale),
                control1: CGPoint(x: 17.5 * scale, y: 7.8 * scale),
                control2: CGPoint(x: 17.9 * scale, y: 9.8 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 16.7 * scale, y: 14.3 * scale),
                control1: CGPoint(x: 18.5 * scale, y: 12.6 * scale),
                control2: CGPoint(x: 17.9 * scale, y: 13.7 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 19.5 * scale, y: 15.8 * scale),
                control1: CGPoint(x: 18.8 * scale, y: 14.3 * scale),
                control2: CGPoint(x: 19.5 * scale, y: 15.1 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 20.4 * scale, y: 17.8 * scale),
                control1: CGPoint(x: 20.1 * scale, y: 16.3 * scale),
                control2: CGPoint(x: 20.4 * scale, y: 17 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 16 * scale, y: 19.3 * scale),
                control1: CGPoint(x: 20.4 * scale, y: 19.6 * scale),
                control2: CGPoint(x: 19 * scale, y: 19.9 * scale)
            )
            path.addLine(to: CGPoint(x: 16 * scale, y: 22.3 * scale))
            path.addCurve(
                to: CGPoint(x: 15.8 * scale, y: 23.6 * scale),
                control1: CGPoint(x: 16 * scale, y: 22.8 * scale),
                control2: CGPoint(x: 15.2 * scale, y: 23.7 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 24 * scale, y: 12.3 * scale),
                control1: CGPoint(x: 20.6 * scale, y: 22.3 * scale),
                control2: CGPoint(x: 24 * scale, y: 17.6 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 12 * scale, y: 0.3 * scale),
                control1: CGPoint(x: 24 * scale, y: 5.7 * scale),
                control2: CGPoint(x: 18.6 * scale, y: 0.3 * scale)
            )
            path.closeSubpath()
            context.fill(path, with: .foreground)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Facebook Icon

private struct FacebookIcon: View {
    let size: CGFloat

    var body: some View {
        Canvas { context, canvasSize in
            let scale = canvasSize.width / 24
            var path = Path()
            path.move(to: CGPoint(x: 22 * scale, y: 12 * scale))
            path.addCurve(
                to: CGPoint(x: 12 * scale, y: 2 * scale),
                control1: CGPoint(x: 22 * scale, y: 6.48 * scale),
                control2: CGPoint(x: 17.52 * scale, y: 2 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 2 * scale, y: 12 * scale),
                control1: CGPoint(x: 6.48 * scale, y: 2 * scale),
                control2: CGPoint(x: 2 * scale, y: 6.48 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 10.75 * scale, y: 21.82 * scale),
                control1: CGPoint(x: 2 * scale, y: 16.94 * scale),
                control2: CGPoint(x: 5.82 * scale, y: 21.12 * scale)
            )
            path.addLine(to: CGPoint(x: 10.75 * scale, y: 15.31 * scale))
            path.addLine(to: CGPoint(x: 8.5 * scale, y: 15.31 * scale))
            path.addLine(to: CGPoint(x: 8.5 * scale, y: 12 * scale))
            path.addLine(to: CGPoint(x: 10.75 * scale, y: 12 * scale))
            path.addLine(to: CGPoint(x: 10.75 * scale, y: 9.56 * scale))
            path.addCurve(
                to: CGPoint(x: 13.83 * scale, y: 6.4 * scale),
                control1: CGPoint(x: 10.75 * scale, y: 7.6 * scale),
                control2: CGPoint(x: 11.95 * scale, y: 6.4 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 16 * scale, y: 6.62 * scale),
                control1: CGPoint(x: 14.72 * scale, y: 6.4 * scale),
                control2: CGPoint(x: 15.43 * scale, y: 6.49 * scale)
            )
            path.addLine(to: CGPoint(x: 16 * scale, y: 8.88 * scale))
            path.addLine(to: CGPoint(x: 14.75 * scale, y: 8.88 * scale))
            path.addCurve(
                to: CGPoint(x: 13.25 * scale, y: 10.44 * scale),
                control1: CGPoint(x: 13.8 * scale, y: 8.88 * scale),
                control2: CGPoint(x: 13.25 * scale, y: 9.35 * scale)
            )
            path.addLine(to: CGPoint(x: 13.25 * scale, y: 12 * scale))
            path.addLine(to: CGPoint(x: 15.85 * scale, y: 12 * scale))
            path.addLine(to: CGPoint(x: 15.44 * scale, y: 15.31 * scale))
            path.addLine(to: CGPoint(x: 13.25 * scale, y: 15.31 * scale))
            path.addLine(to: CGPoint(x: 13.25 * scale, y: 21.82 * scale))
            path.addCurve(
                to: CGPoint(x: 22 * scale, y: 12 * scale),
                control1: CGPoint(x: 18.18 * scale, y: 21.12 * scale),
                control2: CGPoint(x: 22 * scale, y: 16.94 * scale)
            )
            path.closeSubpath()
            context.fill(path, with: .foreground)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Discord Icon

private struct DiscordIcon: View {
    let size: CGFloat

    var body: some View {
        Canvas { context, canvasSize in
            let scale = canvasSize.width / 24
            var path = Path()
            path.move(to: CGPoint(x: 20.32 * scale, y: 4.37 * scale))
            path.addCurve(
                to: CGPoint(x: 15.54 * scale, y: 2.81 * scale),
                control1: CGPoint(x: 18.97 * scale, y: 3.44 * scale),
                control2: CGPoint(x: 15.54 * scale, y: 2.81 * scale)
            )
            path.addLine(to: CGPoint(x: 14.98 * scale, y: 3.62 * scale))
            path.addCurve(
                to: CGPoint(x: 9.02 * scale, y: 3.62 * scale),
                control1: CGPoint(x: 13.23 * scale, y: 3.15 * scale),
                control2: CGPoint(x: 10.77 * scale, y: 3.15 * scale)
            )
            path.addLine(to: CGPoint(x: 8.46 * scale, y: 2.81 * scale))
            path.addCurve(
                to: CGPoint(x: 3.68 * scale, y: 4.37 * scale),
                control1: CGPoint(x: 8.46 * scale, y: 2.81 * scale),
                control2: CGPoint(x: 5.03 * scale, y: 3.44 * scale)
            )
            path.addLine(to: CGPoint(x: 0.67 * scale, y: 17.53 * scale))
            path.addCurve(
                to: CGPoint(x: 6.01 * scale, y: 21.19 * scale),
                control1: CGPoint(x: 0.67 * scale, y: 17.53 * scale),
                control2: CGPoint(x: 3.23 * scale, y: 21.19 * scale)
            )
            path.addLine(to: CGPoint(x: 7.1 * scale, y: 19.8 * scale))
            path.addCurve(
                to: CGPoint(x: 5.53 * scale, y: 18.52 * scale),
                control1: CGPoint(x: 6.2 * scale, y: 19.5 * scale),
                control2: CGPoint(x: 5.53 * scale, y: 18.52 * scale)
            )
            path.addLine(to: CGPoint(x: 5.86 * scale, y: 18.28 * scale))
            path.addCurve(
                to: CGPoint(x: 12 * scale, y: 19.47 * scale),
                control1: CGPoint(x: 7.45 * scale, y: 19.23 * scale),
                control2: CGPoint(x: 9.47 * scale, y: 19.47 * scale)
            )
            path.addCurve(
                to: CGPoint(x: 18.14 * scale, y: 18.28 * scale),
                control1: CGPoint(x: 14.53 * scale, y: 19.47 * scale),
                control2: CGPoint(x: 16.55 * scale, y: 19.23 * scale)
            )
            path.addLine(to: CGPoint(x: 18.47 * scale, y: 18.52 * scale))
            path.addCurve(
                to: CGPoint(x: 16.9 * scale, y: 19.8 * scale),
                control1: CGPoint(x: 18.47 * scale, y: 18.52 * scale),
                control2: CGPoint(x: 17.8 * scale, y: 19.5 * scale)
            )
            path.addLine(to: CGPoint(x: 17.99 * scale, y: 21.19 * scale))
            path.addCurve(
                to: CGPoint(x: 23.33 * scale, y: 17.53 * scale),
                control1: CGPoint(x: 20.77 * scale, y: 21.19 * scale),
                control2: CGPoint(x: 23.33 * scale, y: 17.53 * scale)
            )
            path.closeSubpath()
            context.fill(path, with: .foreground)

            // Left eye
            let leftEye = Path(ellipseIn: CGRect(
                x: 8 * scale, y: 11 * scale,
                width: 2.8 * scale, height: 3 * scale
            ))
            context.fill(leftEye, with: .color(.white.opacity(0.85)))

            // Right eye
            let rightEye = Path(ellipseIn: CGRect(
                x: 13.2 * scale, y: 11 * scale,
                width: 2.8 * scale, height: 3 * scale
            ))
            context.fill(rightEye, with: .color(.white.opacity(0.85)))
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Microsoft Icon

private struct MicrosoftIcon: View {
    let size: CGFloat

    var body: some View {
        let tileSize = size * 0.42
        let gap = size * 0.06
        let offset = tileSize + gap

        return ZStack(alignment: .topLeading) {
            Rectangle().fill(Color(hex: "#F25022"))
                .frame(width: tileSize, height: tileSize)
                .offset(x: 0, y: 0)
            Rectangle().fill(Color(hex: "#7FBA00"))
                .frame(width: tileSize, height: tileSize)
                .offset(x: offset, y: 0)
            Rectangle().fill(Color(hex: "#00A4EF"))
                .frame(width: tileSize, height: tileSize)
                .offset(x: 0, y: offset)
            Rectangle().fill(Color(hex: "#FFB900"))
                .frame(width: tileSize, height: tileSize)
                .offset(x: offset, y: offset)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - X (Twitter) Icon

private struct XIcon: View {
    let size: CGFloat

    var body: some View {
        Canvas { context, canvasSize in
            let scale = canvasSize.width / 24
            var path = Path()
            path.move(to: CGPoint(x: 18.9 * scale, y: 2.25 * scale))
            path.addLine(to: CGPoint(x: 15.55 * scale, y: 2.25 * scale))
            path.addLine(to: CGPoint(x: 10.85 * scale, y: 10.36 * scale))
            path.addLine(to: CGPoint(x: 5.45 * scale, y: 2.25 * scale))
            path.addLine(to: CGPoint(x: 1.75 * scale, y: 2.25 * scale))
            path.addLine(to: CGPoint(x: 9.4 * scale, y: 13.1 * scale))
            path.addLine(to: CGPoint(x: 1.48 * scale, y: 21.75 * scale))
            path.addLine(to: CGPoint(x: 4.84 * scale, y: 21.75 * scale))
            path.addLine(to: CGPoint(x: 10.1 * scale, y: 14.6 * scale))
            path.addLine(to: CGPoint(x: 18.7 * scale, y: 21.75 * scale))
            path.addLine(to: CGPoint(x: 22.25 * scale, y: 21.75 * scale))
            path.addLine(to: CGPoint(x: 14.1 * scale, y: 11.6 * scale))
            path.closeSubpath()
            context.fill(path, with: .foreground)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Fallback Letter Icon

private struct ProviderLetterIcon: View {
    let provider: OAuthProvider
    let size: CGFloat

    var body: some View {
        let letter: String = {
            switch provider {
            case .kakao: return "K"
            case .naver: return "N"
            case .line: return "L"
            default: return String(provider.displayName.prefix(1))
            }
        }()

        let bgColor: Color = {
            switch provider {
            case .kakao: return Color(hex: "#FEE500")
            case .naver: return Color(hex: "#03C75A")
            case .line: return Color(hex: "#06C755")
            default: return Color(hex: provider.brandColor.bg)
            }
        }()

        let textColor: Color = {
            switch provider {
            case .kakao: return Color(hex: "#191919")
            default: return Color(hex: provider.brandColor.text)
            }
        }()

        ZStack {
            Circle()
                .fill(bgColor)
            Text(letter)
                .font(.system(size: size * 0.55, weight: .bold))
                .foregroundStyle(textColor)
        }
        .frame(width: size, height: size)
    }
}
