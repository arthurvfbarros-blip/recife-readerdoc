import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Recife ReaderDoc title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Recife ReaderDoc/i);
  expect(titleElement).toBeInTheDocument();
});
