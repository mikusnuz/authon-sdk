import Foundation

final class EventEmitter: @unchecked Sendable {
    private var listeners: [AuthonEvent: [UUID: (Any?) -> Void]] = [:]
    private let lock = NSLock()

    func on(_ event: AuthonEvent, handler: @escaping (Any?) -> Void) -> () -> Void {
        let id = UUID()
        lock.lock()
        if listeners[event] == nil { listeners[event] = [:] }
        listeners[event]![id] = handler
        lock.unlock()
        return { [weak self] in
            self?.lock.lock()
            self?.listeners[event]?.removeValue(forKey: id)
            self?.lock.unlock()
        }
    }

    func emit(_ event: AuthonEvent, data: Any? = nil) {
        lock.lock()
        let handlers = listeners[event].map { Array($0.values) } ?? []
        lock.unlock()
        for handler in handlers { handler(data) }
    }

    func removeAll() {
        lock.lock()
        listeners.removeAll()
        lock.unlock()
    }
}
