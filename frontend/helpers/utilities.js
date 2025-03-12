export const validateEmail = (email) => {
  if (!email.trim()) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }

  return null;
};

export const validateUsername = (username) => {
  if (!username.trim()) {
    return 'Username is required';
  }

  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }

  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  // Password requirements:
  // - At least 8 characters long
  // - Contains at least one uppercase letter
  // - Contains at least one lowercase letter
  // - Contains at least one number
  // - Contains at least one special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }

  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

export const validateSignUp = (data) => {
  const errors = {};

  // Validate email
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  // Validate password
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  // Validate confirm password
  if (data.confirmPassword) {
    const confirmPasswordError = validateConfirmPassword(
      data.password,
      data.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  }

  return errors;
};
