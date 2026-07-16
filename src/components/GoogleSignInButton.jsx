import React, { useEffect, useRef } from 'react'

// Renders Google's own "Sign in with Google" button and calls onCredential
// with the ID token once the user picks an account.
export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    function renderButton() {
      if (!window.google || !buttonRef.current) return

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      })
    }

    // Google's script loads asynchronously - if it hasn't finished loading
    // yet by the time this component mounts, wait for it briefly.
    if (window.google?.accounts?.id) {
      renderButton()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          renderButton()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [onCredential])

  return <div ref={buttonRef} className="flex justify-center" />
}
