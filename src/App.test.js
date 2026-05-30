import { render, screen } from '@testing-library/react';
import App from './App';
import { SkeletonCard } from './App';

jest.mock('axios');

test('renders masthead title', () => {
  render(<App />);
  expect(screen.getByText(/The Panda Post/i)).toBeInTheDocument();
});

test('SkeletonCard renders a skeleton article card', () => {
  const { container } = render(<SkeletonCard />);
  expect(container.firstChild).toHaveClass('article');
  expect(container.firstChild).toHaveClass('skeleton');
});
