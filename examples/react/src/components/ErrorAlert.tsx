import { describeAuthonError } from '../authonErrors'

export default function ErrorAlert({ error }: { error: unknown }) {
  if (!error) return null
  const { code, message, hint } = describeAuthonError(error)
  return (
    <div className="alert alert-error" role="alert">
      <span className="alert-code">{code}</span>
      {message}
      {hint && <span className="alert-hint">{hint}</span>}
    </div>
  )
}
