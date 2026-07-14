import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "./components/ui/sonner"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./app/NotFound"
import Login from "./app/Login"
import QaDashboard from "./app/QADashboard"
import BatchesDashboard from "./app/BatchesDashboard"

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/qa-dashboard" element={<QaDashboard />} />
          <Route path="/dashboard" element={<BatchesDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
