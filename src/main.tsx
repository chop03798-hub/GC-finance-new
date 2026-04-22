import React from 'react'
import ReactDOM from 'react-dom/client'
import { installTryGcThemeVariables } from './branding/tokens'
import './index.css'
import App from './App'

installTryGcThemeVariables()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
