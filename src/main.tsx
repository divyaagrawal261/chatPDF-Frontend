import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';  // Import BrowserRouter
import App from './App.tsx';
import QueryDetail from './QueryDetail.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>  {/* Wrap App with Router */}
    <Routes>
        <Route path="/query-detail" element={<QueryDetail />} />
      <Route path="/" element={<App />}/>
      </Routes>
    </Router>
  </StrictMode>
);
