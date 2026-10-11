import { StrictMode } from 'react'; import { createRoot } from 'react-dom/client'; import App from './App'; import './styles.css';
document.title = 'Agent Factory Studio — Build AI Agents';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
