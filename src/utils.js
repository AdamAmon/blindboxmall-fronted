export function getToken() {
  return localStorage.getItem('token') || '';
}

export function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || '';
  } catch {
    return '';
  }
} 