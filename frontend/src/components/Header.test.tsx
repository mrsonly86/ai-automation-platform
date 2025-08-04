import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'vi',
      changeLanguage: jest.fn()
    }
  })
}));

const MockedHeader = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
);

describe('Header Component', () => {
  test('renders AI Automation Platform title', () => {
    render(<MockedHeader />);
    const titleElement = screen.getByText(/AI Automation Platform/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<MockedHeader />);
    const homeLink = screen.getByText('home');
    const agentsLink = screen.getByText('agents');
    expect(homeLink).toBeInTheDocument();
    expect(agentsLink).toBeInTheDocument();
  });

  test('renders language toggle button', () => {
    render(<MockedHeader />);
    const languageButton = screen.getByText('EN');
    expect(languageButton).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    render(<MockedHeader />);
    const homeLink = screen.getByText('home').closest('a');
    const agentsLink = screen.getByText('agents').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    expect(agentsLink).toHaveAttribute('href', '/agents');
  });
});