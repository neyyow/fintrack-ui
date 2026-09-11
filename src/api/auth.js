import client from './client'

// POST /login -> { Token, UserId, Email }
export const login = (email, password) =>
  client.post('/login', { Email: email, Password: password }).then((res) => res.data)

// POST /auth/google -> { Token, UserId, Email } - same shape as normal login
export const loginWithGoogle = (idToken) =>
  client.post('/auth/google', { IdToken: idToken }).then((res) => res.data)

// POST /register -> "User registered successfully"
export const register = (username, email, password) =>
  client
    .post('/register', { Username: username, Email: email, Password: password })
    .then((res) => res.data)

// GET /profile
export const getProfile = () =>
  client.get('/profile').then((res) => res.data)

// PUT /profile
// Email is intentionally not sent - it can't be changed after signup (see
// ProfileEndpoints.cs) because it's also the identity key Google Sign-In
// uses to match accounts.
export const updateProfile = (username) =>
  client
    .put('/profile', {
      Username: username
    })
    .then((res) => res.data)
// PUT /change-password
export const changePassword = (
  currentPassword,
  newPassword,
  confirmPassword
) =>
  client
    .put('/change-password', {
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
      ConfirmPassword: confirmPassword
    })
    .then((res) => res.data)