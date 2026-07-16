import React, { useEffect, useRef, useState } from 'react'

const CUSTOM_OPTION = '__custom__'

// A custom dropdown (not a native <select>) so custom entries can show an
// inline delete button — something a real <select><option> can't render.
export default function CategoryPicker({ id, label, options, value, onChange, onDeleteCustom }) {
  const isKnownValue = options.some((o) => o.name === value)
  const [mode, setMode] = useState(value && !isKnownValue ? 'custom' : 'select')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function selectOption(name) {
    onChange(name)
    setOpen(false)
  }

  function startCustom() {
    setMode('custom')
    onChange('')
    setOpen(false)
  }

  function backToList() {
    setMode('select')
    onChange(options[0]?.name ?? '')
  }

  function handleDeleteCustom(e, name) {
    e.stopPropagation() // don't also trigger selectOption on the row underneath
    if (!window.confirm(`Remove "${name}" from the ${label.toLowerCase()} list? Past entries keep this label — this only stops it being suggested again.`)) return
    onDeleteCustom(name)
    if (value === name) onChange(options.find((o) => o.name !== name && !o.custom)?.name ?? '')
  }

  if (mode === 'custom') {
    return (
      <div>
        <label className="label-field" htmlFor={id}>{label}</label>
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            required
            maxLength={30}
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-field"
            placeholder={`Type a ${label.toLowerCase()} name`}
          />
          <button type="button" onClick={backToList} className="btn-secondary whitespace-nowrap" title="Choose from the list instead">
            Use list
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="label-field" htmlFor={id}>{label}</label>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="input-field text-left flex items-center justify-between"
      >
        <span>{value || 'Select...'}</span>
        <span className={`text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="ledger-card absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-paper shadow-lg py-1">
          {options.map((o) => (
            <div
              key={o.name}
              onClick={() => selectOption(o.name)}
              className={`group flex items-center justify-between px-3.5 py-2 cursor-pointer hover:bg-pine/10 ${
                o.name === value ? 'bg-pine/10' : ''
              }`}
            >
              <span className="text-ink">{o.name}</span>
              {o.custom && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustom(e, o.name)}
                  className="hidden group-hover:inline-flex items-center text-ink/40 hover:text-rust leading-none text-base px-1.5"
                  title={`Remove "${o.name}" from suggestions`}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <div
            onClick={startCustom}
            className="px-3.5 py-2 cursor-pointer text-pine-dark hover:bg-pine/10 border-t border-pine/10 mt-1"
          >
            + Add custom {label.toLowerCase()}...
          </div>
        </div>
      )}
    </div>
  )
}
