export const executeQuery = async (sessionId: string, query: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await supabase.auth.getSession()}`
      },
      body: JSON.stringify({ session_id: sessionId, query })
    });
    return response.json();
  }
  