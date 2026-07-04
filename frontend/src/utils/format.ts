export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))

export const orderStatusLabel: Record<string, string> = {
  Pending: 'Aguardando',
  Confirmed: 'Confirmado',
  Processing: 'Em Processamento',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
  Refunded: 'Reembolsado',
}

export const orderStatusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
}
