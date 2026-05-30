import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

test('renders correct number of page buttons', () => {
  render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('prev button is disabled on first page', () => {
  render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
  expect(screen.getByText('Prev')).toBeDisabled();
});

test('next button is disabled on last page', () => {
  render(<Pagination currentPage={3} totalPages={3} onPageChange={() => {}} />);
  expect(screen.getByText('Next')).toBeDisabled();
});

test('clicking page button calls onPageChange with correct page number', () => {
  const mockOnPageChange = jest.fn();
  render(<Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />);
  fireEvent.click(screen.getByText('2'));
  expect(mockOnPageChange).toHaveBeenCalledWith(2);
});

test('renders nothing when totalPages is 1', () => {
  const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
  expect(container.firstChild).toBeNull();
});
