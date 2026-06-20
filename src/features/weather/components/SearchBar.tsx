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
    <div className="w-full">
      <Input
        placeholder="Search for a city..."
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
    </div>
  );
}
