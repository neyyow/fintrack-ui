import client from './client'

// POST /login -> { Token, UserId, Email }
export const login = (email, password) =>
  client.post('/login', { Email: email, Password: password }).then((res) => res.data)

// POST /register -> "User registered successfully"
export const register = (username, email, password) =>
  client
    .post('/register', { Username: username, Email: email, Password: password })
    .then((res) => res.data)

// GET /profile
export const getProfile = () =>
  client.get('/profile').then((res) => res.data)

// PUT /profile
export const updateProfile = (username, email) =>
  client
    .put('/profile', {
      Username: username,
      Email: email
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