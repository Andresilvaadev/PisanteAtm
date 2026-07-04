import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

import { HomePage } from '@/pages/HomePage'
import { CatalogPage } from '@/pages/CatalogPage'
import { ProductPage } from '@/pages/ProductPage'
import { CartPage } from '@/pages/CartPage'

import { LoginPage } from '@/pages/auth/LoginPage'

import { CheckoutPage } from '@/pages/CheckoutPage'

import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        }}
      />

      <Routes>
        {/* Login — apenas para admin/employee */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin — protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="produtos" element={<AdminProductsPage />} />
          <Route path="produtos/novo" element={<AdminProductFormPage />} />
          <Route path="produtos/:id/editar" element={<AdminProductFormPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="usuarios" element={<div className="text-gray-500 p-4">Em breve</div>} />
        </Route>

        {/* Loja — pública */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="produto/:slug" element={<ProductPage />} />
          <Route path="carrinho" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />

          <Route path="404" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h1 className="text-6xl font-black text-gray-200">404</h1>
              <p className="text-gray-500">Página não encontrada</p>
              <a href="/" className="text-brand-600 font-medium hover:underline">Voltar ao início</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
