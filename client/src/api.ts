export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include', // <- importante para enviar cookies
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  try {
    let res = await fetch(url, defaultOptions);
    // Si el token expiró, intentar refresh token
    if (res.status === 401) {
      const refresh = await fetch('/refresh-token', { method: 'POST', credentials: 'include' });
      if (refresh.ok) {
        res = await fetch(url, defaultOptions); // reintentar la request
      } else {
        throw new Error('Session expired');
      }
    }
    
    // Intentar parsear el body como JSON
    let data = null;
    try {
      data = await res.json();
    } catch {
      // Si no es JSON, dejarlo como null
      data = null;
    }
    
    return { status: res.status, ok: res.ok, data };
  }
  catch(err) {
    console.error('apiFetch error:', err);
    throw err;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await apiFetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errorMsg = res.data?.error || res.data?.message || 'Login failed';
      throw new Error(errorMsg);
    }
    return res.data;
  }
  catch(err) {
    console.error('loginUser error:', err);
    throw err;
  }
};

export const registerUser = async (fullName: string, email: string, password: string) => {
  try {
    const res = await apiFetch('/signIn', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
    if (!res.ok) {
      // Mostrar información detallada del error
      const errorMsg = res.data?.error || res.data?.message || `Registration failed (Status: ${res.status})`;
      console.error('Server error response:', res.data);
      throw new Error(errorMsg);
    }
    return res.data;
  } catch (err) {
    console.error('Error in registerUser:', err);
    throw err;
  }
};

