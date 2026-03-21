import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { StudyProvider } from './context/StudyContext'
import { AddPage } from './pages/AddPage'
import { DeckPage } from './pages/DeckPage'
import { HomePage } from './pages/HomePage'
import { ReviewPage } from './pages/ReviewPage'
import { SettingsPage } from './pages/SettingsPage'
import { SummaryPage } from './pages/SummaryPage'

function App() {
  return (
    <BrowserRouter>
      <StudyProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/deck" element={<DeckPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </StudyProvider>
    </BrowserRouter>
  )
}

export default App
