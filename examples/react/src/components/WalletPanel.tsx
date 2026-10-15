import { useCallback, useEffect, useState } from 'react'
import { useAuthon } from '@authon/react'
import type { EmbeddedWallet } from '@authon/js'
import ErrorAlert from './ErrorAlert'

type Action = 'load' | 'sign' | 'protect' | 'restore' | null

export default function WalletPanel() {
  // @authon/react has no wallet hook, so the panel uses the core client: client.wallet.
  const { client } = useAuthon()
  const [wallet, setWallet] = useState<EmbeddedWallet | null>(null)
  const [message, setMessage] = useState('Hello from Authon')
  const [signature, setSignature] = useState<string | null>(null)
  const [busy, setBusy] = useState<Action>(null)
  const [error, setError] = useState<unknown>(null)

  const run = useCallback(async (action: Action, fn: () => Promise<void>) => {
    setBusy(action)
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(null)
    }
  }, [])

  const load = useCallback(() => {
    if (!client) return
    // ensure() returns the wallet, creating it on first use (autoCreate also does this after sign-in).
    void run('load', async () => setWallet(await client.wallet.ensure()))
  }, [client, run])

  useEffect(() => {
    if (!client) return
    load()
    const offChange = client.on('walletChanged', (next) => setWallet(next))
    const offError = client.on('walletError', (err) => setError(err))
    return () => {
      offChange()
      offError()
    }
  }, [client, load])

  if (!client) return null

  const sign = () =>
    run('sign', async () => {
      setSignature(null)
      setSignature(await client.wallet.signMessage(message))
    })

  // protect() and restore() open a passkey prompt, so they must run straight from a click.
  const protect = () =>
    run('protect', async () => {
      await client.wallet.protect()
      setWallet(await client.wallet.get())
    })

  const restore = (resetOtherDevices: boolean) =>
    run('restore', async () => {
      await client.wallet.restore({ resetOtherDevices })
      setWallet(await client.wallet.get())
    })

  return (
    <div className="panel">
      <div className="panel-title">Wallet</div>
      <p className="panel-desc">An embedded EVM wallet created for this account. The project must have wallets turned on.</p>

      {busy === 'load' && !wallet && <p className="panel-desc">Loading wallet...</p>}

      {wallet && (
        <>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value mono" title={wallet.address}>{wallet.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Passkey backup</span>
              <span className={`info-badge ${wallet.protected ? 'badge-green' : 'badge-yellow'}`}>
                {wallet.protected ? 'Protected' : 'Not protected'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">This browser</span>
              <span className={`info-badge ${wallet.needsRestore ? 'badge-yellow' : 'badge-green'}`}>
                {wallet.needsRestore ? 'Needs restore' : 'Ready'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Devices</span>
              <span className="info-value">{wallet.devices.length}</span>
            </div>
          </div>

          {wallet.needsRestore && (
            <div className="field-row">
              <button className="btn btn-primary btn-sm" disabled={busy !== null} onClick={() => restore(false)}>
                {busy === 'restore' ? 'Restoring...' : 'Restore wallet'}
              </button>
              <button className="btn btn-outline btn-sm" disabled={busy !== null} onClick={() => restore(true)}>
                Restore and reset other devices
              </button>
            </div>
          )}

          {!wallet.protected && !wallet.needsRestore && (
            <button className="btn btn-primary btn-sm" disabled={busy !== null} onClick={protect}>
              {busy === 'protect' ? 'Protecting...' : 'Protect wallet'}
            </button>
          )}

          <div className="field-row">
            <input className="field" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="btn btn-outline btn-sm" disabled={busy !== null || !message} onClick={sign}>
              {busy === 'sign' ? 'Signing...' : 'Sign message'}
            </button>
          </div>
          {signature && <div className="output">{signature}</div>}
        </>
      )}

      <ErrorAlert error={error} />
      {!wallet && error !== null && busy === null && (
        <button className="btn btn-outline btn-sm" onClick={load}>Try again</button>
      )}
    </div>
  )
}
