import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

//====//

interface AutoCompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
}

export default function Autocomplete({ value = '', onChange, fetchSuggestions }: AutoCompleteProps) {
  const [query, setQuery] = useState(value)
  const [debouncedQuery] = useDebounce(query, 300)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const fetchSuggestionsCallback = useCallback(async (q: string) => {
    if (q.trim() === '') {
      setSuggestions([])
      return
    }
    setIsLoading(true)
    const results = await fetchSuggestions(q)
    setSuggestions(results)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (debouncedQuery && isFocused) {
      fetchSuggestionsCallback(debouncedQuery)
    } else {
      setSuggestions([])
    }
  }, [debouncedQuery, fetchSuggestionsCallback, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      setQuery(suggestions[selectedIndex])
      setSuggestions([])
      setSelectedIndex(-1)
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setSelectedIndex(-1)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onChange?.(suggestion)
    setSuggestions([])
    setSelectedIndex(-1)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events on suggestions
    setTimeout(() => {
      setIsFocused(false)
      setSuggestions([])
      setSelectedIndex(-1)
    }, 200)
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pr-10"
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={suggestions.length > 0}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {isLoading && isFocused && (
        <div
          className="mt-2 p-2 bg-background border rounded-md shadow-sm absolute z-10"
          aria-live="polite"
        >
          Loading...
        </div>
      )}
      {suggestions.length > 0 && !isLoading && isFocused && (
        <ul
          id="suggestions-list"
          className="mt-2 bg-background border rounded-md shadow-sm absolute z-10"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`px-4 py-2 cursor-pointer hover:bg-muted ${index === selectedIndex ? 'bg-muted' : ''
                }`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
