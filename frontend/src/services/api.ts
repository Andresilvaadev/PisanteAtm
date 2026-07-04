import axios from 'axios'

// Instância Axios legada — usada pelas páginas públicas que ainda apontam para o backend C#.
// As páginas de admin e o checkout já usam o cliente Supabase diretamente.
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export default api
