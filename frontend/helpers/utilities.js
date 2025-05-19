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

export const validateAdditionalDetails = (data) => {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.organisation && !data.org_name) {
    errors.organisation = 'Organization is required';
  }

  if (!data.role) {
    errors.role = 'Role is required';
  }

  if (
    !data.countryOfResidence ||
    (Array.isArray(data.countryOfResidence) &&
      data.countryOfResidence.length === 0)
  ) {
    errors.countryOfResidence = 'Country is required';
  }

  if (
    data.regions &&
    Array.isArray(data.regions) &&
    data.regions.length === 0
  ) {
    errors.regions = 'Please select at least one region';
  }

  if (data.topics && Array.isArray(data.topics) && data.topics.length === 0) {
    errors.topics = 'Please select at least one topic';
  }

  if (!data.looking_fors) {
    errors.looking_fors = 'Please select what you are looking for';
  }

  if (data.linkedin && data.linkedin.trim()) {
    const linkedinRegex =
      /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;

    if (!linkedinRegex.test(data.linkedin.trim())) {
      errors.linkedin =
        'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)';
    }
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms to continue';
  }

  return errors;
};

export const getTruncatedFilename = (filePath, maxLength = 20) => {
  const filename = filePath.split('/').pop();
  const [name, extension] = filename.split(/\.(?=[^\.]+$)/);
  if (name.length > maxLength) {
    return `${name.substring(0, maxLength)}...${extension}`;
  }
  return filename;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = 2011; year <= currentYear; year++) {
    years.push(year.toString());
  }

  return years.sort((a, b) => parseInt(b) - parseInt(a));
};
