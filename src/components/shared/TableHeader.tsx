import SearcherX from './SearchX';

type TableHeaderProps = {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actionLabel?: string;
  onActionClick?: () => void;
  children?: React.ReactNode;
};

export default function TableHeader({
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  actionLabel,
  onActionClick,
  children,
}: TableHeaderProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      {/* Left */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {onSearchChange && (
          <SearcherX
            value={searchValue}
            placeholder={searchPlaceholder}
            className="w-full sm:w-[39.5%]"
            onSearch={onSearchChange}
          />
        )}

        {/* Extra filters / controls */}
        {children}
      </div>

      {/* Right */}
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
