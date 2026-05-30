import { render, screen } from '@testing-library/react';
import App from './App';
import { SkeletonCard, FeaturedArticle } from './App';

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

const mockArticle = {
  title: 'Giant Panda Cubs Born at Zoo',
  url: 'https://example.com/article',
  urlToImage: null,
  description: 'Two giant panda cubs were born.',
  publishedAt: '2026-05-30T10:00:00Z',
  source: 'Guardian',
};

test('FeaturedArticle renders article title', () => {
  render(<FeaturedArticle article={mockArticle} />);
  expect(screen.getByText('Giant Panda Cubs Born at Zoo')).toBeInTheDocument();
});

test('FeaturedArticle renders nothing when article is null', () => {
  const { container } = render(<FeaturedArticle article={null} />);
  expect(container.firstChild).toBeNull();
});

test('FeaturedArticle renders Featured label', () => {
  render(<FeaturedArticle article={mockArticle} />);
  expect(screen.getByText('Featured')).toBeInTheDocument();
});
