import { Input } from '../../../components/ui';

export interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSearch(trimmed);
    }
  };

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="w-full"
    >
      <label htmlFor="city-search-input" className="sr-only">
        Search for a city
      </label>
      <Input
        id="city-search-input"
        placeholder="Search for a city..."
        onSubmit={handleSubmit}
        disabled={isLoading}
        aria-label="Search for a city"
        aria-describedby="search-helper-text"
      />
    </form>
  );
}
