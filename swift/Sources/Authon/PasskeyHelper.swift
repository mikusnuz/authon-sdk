import AuthenticationServices
import Foundation

// MARK: - WebAuthn Option Types

struct WebAuthnRegistrationOptions: Decodable {
    let challenge: String
    let rp: RPEntity
    let user: UserEntity
    let pubKeyCredParams: [PubKeyCredParam]?
    let excludeCredentials: [CredentialDescriptor]?
    let authenticatorSelection: AuthenticatorSelection?

    struct RPEntity: Decodable {
        let id: String
        let name: String
    }

    struct UserEntity: Decodable {
        let id: String
        let name: String
        let displayName: String
    }

    struct PubKeyCredParam: Decodable {
        let type: String
        let alg: Int
    }

    struct CredentialDescriptor: Decodable {
        let id: String
        let type: String
    }

    struct AuthenticatorSelection: Decodable {
        let residentKey: String?
        let userVerification: String?
    }
}

struct WebAuthnAuthenticationOptions: Decodable {
    let challenge: String
    let rpId: String?
    let allowCredentials: [CredentialDescriptor]?

    struct CredentialDescriptor: Decodable {
        let id: String
        let type: String
    }
}

// MARK: - WebAuthn Result Types

struct PasskeyRegistrationResult: Encodable {
    let id: String
    let rawId: String
    let type: String
    let response: ResponseData
    let authenticatorAttachment: String?

    struct ResponseData: Encodable {
        let clientDataJSON: String
        let attestationObject: String
    }
}

struct PasskeyAuthenticationResult: Encodable {
    let id: String
    let rawId: String
    let type: String
    let response: ResponseData

    struct ResponseData: Encodable {
        let clientDataJSON: String
        let authenticatorData: String
        let signature: String
        let userHandle: String?
    }
}

// MARK: - PasskeyHelper

@available(iOS 16.0, macOS 13.0, *)
final class PasskeyHelper: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {

    private var continuation: CheckedContinuation<Any, Error>?

    static func register(options: WebAuthnRegistrationOptions) async throws -> PasskeyRegistrationResult {
        let helper = PasskeyHelper()
        return try await helper.performRegistration(options: options)
    }

    static func authenticate(options: WebAuthnAuthenticationOptions) async throws -> PasskeyAuthenticationResult {
        let helper = PasskeyHelper()
        return try await helper.performAuthentication(options: options)
    }

    private func performRegistration(options: WebAuthnRegistrationOptions) async throws -> PasskeyRegistrationResult {
        guard let challengeData = Data(base64URLEncoded: options.challenge) else {
            throw AuthonError(statusCode: 400, message: "Invalid challenge", code: "invalid_challenge")
        }
        guard let userIdData = Data(base64URLEncoded: options.user.id) else {
            throw AuthonError(statusCode: 400, message: "Invalid user ID", code: "invalid_user_id")
        }

        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: options.rp.id)
        let request = provider.createCredentialRegistrationRequest(
            challenge: challengeData,
            name: options.user.name,
            userID: userIdData
        )

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self

        return try await withCheckedThrowingContinuation { cont in
            self.continuation = cont as CheckedContinuation<Any, Error>
            controller.performRequests()
        } as! PasskeyRegistrationResult
    }

    private func performAuthentication(options: WebAuthnAuthenticationOptions) async throws -> PasskeyAuthenticationResult {
        guard let challengeData = Data(base64URLEncoded: options.challenge) else {
            throw AuthonError(statusCode: 400, message: "Invalid challenge", code: "invalid_challenge")
        }

        guard let rpId = options.rpId, !rpId.isEmpty else {
            throw AuthonError(statusCode: 400, message: "Server did not provide rpId for passkey authentication", code: "missing_rp_id")
        }
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
        let request = provider.createCredentialAssertionRequest(challenge: challengeData)

        if let allowCredentials = options.allowCredentials {
            request.allowedCredentials = allowCredentials.compactMap { cred in
                guard let credIdData = Data(base64URLEncoded: cred.id) else { return nil }
                return ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: credIdData)
            }
        }

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self

        return try await withCheckedThrowingContinuation { cont in
            self.continuation = cont as CheckedContinuation<Any, Error>
            controller.performRequests()
        } as! PasskeyAuthenticationResult
    }

    // MARK: - ASAuthorizationControllerDelegate

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        if let registration = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
            let result = PasskeyRegistrationResult(
                id: registration.credentialID.base64URLEncodedString(),
                rawId: registration.credentialID.base64URLEncodedString(),
                type: "public-key",
                response: .init(
                    clientDataJSON: registration.rawClientDataJSON.base64URLEncodedString(),
                    attestationObject: registration.rawAttestationObject?.base64URLEncodedString() ?? ""
                ),
                authenticatorAttachment: "platform"
            )
            continuation?.resume(returning: result)
        } else if let assertion = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
            let result = PasskeyAuthenticationResult(
                id: assertion.credentialID.base64URLEncodedString(),
                rawId: assertion.credentialID.base64URLEncodedString(),
                type: "public-key",
                response: .init(
                    clientDataJSON: assertion.rawClientDataJSON.base64URLEncodedString(),
                    authenticatorData: assertion.rawAuthenticatorData.base64URLEncodedString(),
                    signature: assertion.signature.base64URLEncodedString(),
                    userHandle: assertion.userID.base64URLEncodedString()
                )
            )
            continuation?.resume(returning: result)
        }
        continuation = nil
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        continuation?.resume(throwing: error)
        continuation = nil
    }

    // MARK: - ASAuthorizationControllerPresentationContextProviding

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        #if canImport(UIKit)
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
        #else
        return NSApplication.shared.keyWindow ?? ASPresentationAnchor()
        #endif
    }
}

// MARK: - Base64URL Helpers

extension Data {
    init?(base64URLEncoded string: String) {
        var base64 = string
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")
        let remainder = base64.count % 4
        if remainder > 0 {
            base64.append(contentsOf: repeatElement("=", count: 4 - remainder))
        }
        self.init(base64Encoded: base64)
    }

    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
