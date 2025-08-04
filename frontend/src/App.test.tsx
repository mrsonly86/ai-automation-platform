import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'vi',
      changeLanguage: jest.fn()
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn()
  }
}));

const MockedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe('App Component', () => {
  test('renders AI Automation Platform header', () => {
    render(<MockedApp />);
    const headerElement = screen.getByText(/AI Automation Platform/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<MockedApp />);
    const homeLink = screen.getByText('home');
    const agentsLink = screen.getByText('agents');
    expect(homeLink).toBeInTheDocument();
    expect(agentsLink).toBeInTheDocument();
  });

  test('renders Vietnamese language support', () => {
    render(<MockedApp />);
    const vietnameseText = screen.getByText('welcome');
    expect(vietnameseText).toBeInTheDocument();
  });
});