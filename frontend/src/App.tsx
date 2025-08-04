import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AIAgentsPage from './pages/AIAgentsPage';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agents" element={<AIAgentsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;