import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios');

test('renders masthead title', () => {
  render(<App />);
  expect(screen.getByText(/The Panda Post/i)).toBeInTheDocument();
});
