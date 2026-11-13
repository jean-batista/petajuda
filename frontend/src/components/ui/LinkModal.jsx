export function LinkModal({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
      {children}
    </button>
  )
}