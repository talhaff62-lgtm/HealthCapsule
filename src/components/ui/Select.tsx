"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  portal?: boolean;
};

export default function Select({
  name,
  id: idProp,
  value: valueProp,
  defaultValue = "",
  onChange,
  options,
  placeholder = "Select…",
  label,
  searchable,
  clearable = true,
  disabled = false,
  className = "",
  portal = false,
}: SelectProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? valueProp : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const baseId = useId();
  const triggerId = idProp ?? `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const searchId = `${baseId}-search`;

  const isSearchable = searchable ?? options.length > 8;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, normalizedQuery]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const highlightedIndex = useMemo(() => {
    const index = filteredOptions.findIndex(
      (option) => option.value === highlightedValue
    );
    return index >= 0 ? index : 0;
  }, [filteredOptions, highlightedValue]);

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setQuery("");
    const selectedIndex = options.findIndex((option) => option.value === value);
    setHighlightedValue(
      options[selectedIndex >= 0 ? selectedIndex : 0]?.value || null
    );
    setIsOpen(true);
  }, [disabled, options, value]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setHighlightedValue(null);
  }, []);

  const selectOption = useCallback(
    (optionValue: string) => {
      setValue(optionValue);
      closeDropdown();
    },
    [setValue, closeDropdown]
  );

  const clearSelection = useCallback(
    (event?: React.MouseEvent | React.KeyboardEvent) => {
      event?.stopPropagation();
      setValue("");
      if (isOpen) {
        setQuery("");
        setHighlightedValue(options[0]?.value || null);
        searchInputRef.current?.focus();
      }
    },
    [setValue, isOpen, options]
  );

  // Focus search input when dropdown opens.
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll highlighted option into view.
  useEffect(() => {
    const option = optionRefs.current[highlightedIndex];
    if (option && listboxRef.current) {
      option.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Close on click outside.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideContainer = containerRef.current?.contains(target) ?? false;
      const insideDropdown = dropdownRef.current?.contains(target) ?? false;
      if (!insideContainer && !insideDropdown) {
        closeDropdown();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closeDropdown]);

  // Reposition dropdown when using portal rendering.
  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    if (!trigger || !dropdown) return;

    const rect = trigger.getBoundingClientRect();
    const dropdownHeight = dropdown.offsetHeight;
    const viewportHeight = window.innerHeight;
    const margin = 6;
    const spaceBelow = viewportHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      top: openUpward ? rect.top - dropdownHeight - margin : rect.bottom + margin,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useLayoutEffect(() => {
    if (!portal || !isOpen) return;

    updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();
    const handleScroll = () => updateDropdownPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [portal, isOpen, updateDropdownPosition]);

  // Close on Escape.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        event.stopPropagation();
        closeDropdown();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openDropdown();
    }
  }

  function moveHighlight(direction: "next" | "prev") {
    if (filteredOptions.length === 0) return;

    const nextIndex =
      direction === "next"
        ? highlightedIndex < filteredOptions.length - 1
          ? highlightedIndex + 1
          : 0
        : highlightedIndex > 0
        ? highlightedIndex - 1
        : filteredOptions.length - 1;

    setHighlightedValue(filteredOptions[nextIndex].value);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        moveHighlight("next");
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        moveHighlight("prev");
        break;
      }
      case "Home": {
        event.preventDefault();
        if (filteredOptions.length > 0) {
          setHighlightedValue(filteredOptions[0].value);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        if (filteredOptions.length > 0) {
          setHighlightedValue(filteredOptions[filteredOptions.length - 1].value);
        }
        break;
      }
      case "Enter": {
        event.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (option) {
          selectOption(option.value);
        }
        break;
      }
      case "Tab": {
        closeDropdown();
        break;
      }
    }
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    const nextFiltered = nextQuery.trim()
      ? options.filter((option) =>
          option.label.toLowerCase().includes(nextQuery.trim().toLowerCase())
        )
      : options;
    if (nextFiltered.length > 0) {
      setHighlightedValue(nextFiltered[0].value);
    }
  }

  function handleOptionMouseEnter(optionValue: string) {
    setHighlightedValue(optionValue);
  }

  function handleOptionClick(optionValue: string) {
    selectOption(optionValue);
  }

  const hasValue = value !== "" && value !== undefined;
  const showClear = clearable && hasValue && !disabled;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden native select preserves form integration. */}
      {name && (
        <select
          name={name}
          value={value}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {label && (
        <label
          htmlFor={triggerId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-brand-muted"
        >
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
        className={`
          flex w-full items-center justify-between gap-2 rounded-lg border bg-white
          px-3 py-2.5 text-left text-sm transition
          ${
            disabled
              ? "cursor-not-allowed border-brand-gray bg-brand-mist text-brand-muted"
              : "border-brand-gray text-brand-slate hover:border-brand-sky-light"
          }
          ${
            isOpen && !disabled
              ? "border-brand-sky ring-2 ring-brand-sky/20"
              : ""
          }
        `}
      >
        <span className={hasValue ? "text-brand-slate" : "text-brand-muted"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {showClear && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={(event) => clearSelection(event)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  clearSelection(event);
                }
              }}
              className="rounded p-0.5 text-brand-muted hover:bg-brand-cloud hover:text-brand-slate"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-brand-muted transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <DropdownPanel
          ref={dropdownRef}
          portal={portal}
          dropdownStyle={dropdownStyle}
          listboxId={listboxId}
          searchId={searchId}
          isSearchable={isSearchable}
          query={query}
          onQueryChange={handleSearchChange}
          onSearchKeyDown={handleSearchKeyDown}
          searchInputRef={searchInputRef}
          listboxRef={listboxRef}
          filteredOptions={filteredOptions}
          highlightedIndex={highlightedIndex}
          selectedValue={value}
          onOptionHover={handleOptionMouseEnter}
          onOptionClick={handleOptionClick}
          optionRefs={optionRefs}
          baseId={baseId}
          label={label}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

type DropdownPanelProps = {
  portal: boolean;
  dropdownStyle: React.CSSProperties;
  listboxId: string;
  searchId: string;
  isSearchable: boolean;
  query: string;
  onQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  listboxRef: React.RefObject<HTMLUListElement | null>;
  filteredOptions: SelectOption[];
  highlightedIndex: number;
  selectedValue: string;
  onOptionHover: (value: string) => void;
  onOptionClick: (value: string) => void;
  optionRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  baseId: string;
  label?: string;
  placeholder?: string;
};

const DropdownPanel = React.forwardRef<HTMLDivElement, DropdownPanelProps>(
  function DropdownPanel(
    {
      portal,
      dropdownStyle,
      listboxId,
      searchId,
      isSearchable,
      query,
      onQueryChange,
      onSearchKeyDown,
      searchInputRef,
      listboxRef,
      filteredOptions,
      highlightedIndex,
      selectedValue,
      onOptionHover,
      onOptionClick,
      optionRefs,
      baseId,
      label,
      placeholder,
    },
    ref
  ) {
    const content = (
      <div
        ref={ref}
        style={portal ? dropdownStyle : undefined}
        className={`
          flex max-h-72 flex-col overflow-hidden rounded-xl border border-brand-gray
          bg-white shadow-lg animate-[fadeIn_120ms_ease-out]
          ${portal ? "" : "absolute z-50 mt-1.5 w-full"}
        `}
      >
        {isSearchable && (
          <div className="border-b border-brand-gray px-3 py-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                id={searchId}
                type="text"
                value={query}
                onChange={onQueryChange}
                onKeyDown={onSearchKeyDown}
                placeholder="Search…"
                aria-controls={listboxId}
                aria-autocomplete="list"
                className="w-full rounded-lg border border-brand-gray bg-white py-2 pl-8 pr-3 text-sm text-brand-slate placeholder:text-brand-muted focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/20"
              />
            </div>
          </div>
        )}

        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={label ?? placeholder}
          className="min-h-0 flex-1 overflow-y-auto py-1"
        >
          {filteredOptions.length === 0 ? (
            <li
              role="option"
              aria-selected="false"
              className="px-3 py-2.5 text-sm text-brand-muted"
            >
              No matches found
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === selectedValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  id={`${baseId}-option-${index}`}
                  onMouseEnter={() => onOptionHover(option.value)}
                  onClick={() => onOptionClick(option.value)}
                  className={`
                    flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition
                    ${
                      isHighlighted
                        ? "bg-brand-sky-bg text-brand-navy"
                        : "text-brand-slate"
                    }
                    ${isSelected ? "font-medium" : ""}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-brand-sky" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    );

    if (portal && typeof document !== "undefined") {
      return createPortal(content, document.body);
    }

    return content;
  }
);
