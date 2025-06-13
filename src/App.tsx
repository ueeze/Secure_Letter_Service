import { Routes, Route, Navigate } from 'react-router-dom'
import WriteNote from './pages/WriteNote'
import ViewNote from './pages/ViewNote'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WriteNote />} />
      <Route path="/note/:id" element={<ViewNote />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App