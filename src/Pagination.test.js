import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

test('renders correct number of page buttons', () => {
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('prev button is disabled on first page', () => {
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.getByText('Prev')).toBeDisabled();
});

test('next button is disabled on last page', () => {
  render(<Pagination currentPage={3} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.getByText('Next')).toBeDisabled();
});

test('clicking page button calls onPageChange with correct page number', () => {
  const mockOnPageChange = jest.fn();
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={mockOnPageChange} onPageSizeChange={() => {}} />);
  fireEvent.click(screen.getByText('2'));
  expect(mockOnPageChange).toHaveBeenCalledWith(2);
});

test('changing pageSize dropdown calls onPageSizeChange with numeric value', () => {
  const mockOnPageSizeChange = jest.fn();
  render(<Pagination currentPage={1} totalPages={3} pageSize={20} onPageChange={() => {}} onPageSizeChange={mockOnPageSizeChange} />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '50' } });
  expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
});

test('page navigation controls not rendered when totalPages is 1', () => {
  render(<Pagination currentPage={1} totalPages={1} pageSize={20} onPageChange={() => {}} onPageSizeChange={() => {}} />);
  expect(screen.queryByText('Prev')).not.toBeInTheDocument();
  expect(screen.queryByText('Next')).not.toBeInTheDocument();
});
