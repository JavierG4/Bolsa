export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include', // <- importante para enviar cookies
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  try {
    console.log('Trying to fetch:', url, defaultOptions);
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
    return {status: res.status, ok: res.ok, data: await res.json()};
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
      throw new Error('Login failed');
    }
    return res.ok
  }
  catch(err) {
    console.error('loginUser error:', err);
    throw err;
  }
};

export const registerUser = async (fullName: string, email: string, password: string) => {
  try {
    const res = await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({ userName: fullName, mail: email, password: password }),
    });
    if (!res.ok) {
      throw new Error(res.data?.error || 'Registration failed');
    }
    return res.ok;
  } catch (err) {
    console.error('Error in registerUser:', err);
    throw err;
  }
};

export const getUserPatrimony = async () => {
  const res = await apiFetch("/me/patrimonio", {
    method: "GET"
  });

  if (!res.ok) throw new Error("Error getting patrimony");

  return res.data.patrimonio;
};

export const buyAsset = async (symbol: string, quantity: number, price: number, type: string) => {
  const res = await apiFetch("/me/add", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
      avgBuyPrice: price,
      type,
    }),
  });

  if (!res.ok) {
    throw new Error(res.data?.error || "Error buying asset");
  }

  return res.ok;
};

export const sellAsset = async (symbol: string, quantity: number, price: number, type: string) => {
  const res = await apiFetch("/me/sell", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      quantity,
      sellPrice: price,
      type,
    }),
  });

  if (!res.ok) {
    throw new Error(res.data?.error || "Error selling asset");
  }

  return res.ok;
};
