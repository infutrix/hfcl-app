import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "./components/ui/sonner"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import NotFound from "./app/NotFound"
import UserDashboard from "./app/UserDashboard"
import Login from "./app/Login"
import QaDashboard from "./app/QaDashboard"
import QaDashboardTest from "./app/QaDashboardTest"

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<QaDashboard />} />
          <Route path="/dashboardtest" element={<QaDashboardTest />} />
          <Route path="/userdashboard" element={<UserDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
