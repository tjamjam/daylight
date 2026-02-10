import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { TrustProvider } from './contexts/TrustContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TrustProvider>
        <App />
      </TrustProvider>
    </BrowserRouter>
  </StrictMode>,
)
