import { useEffect, useId, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import './FlowerCombobox.css';

export default function AsyncCombobox({
  fetchOptions,
  getOptionKey,
  getOptionLabel,
  renderOption,
  onSelect,
  placeholder = 'Gõ để tìm...',
  initialQuery = '',
  selectedLabel = '',
  valueId = '',
  minChars = 0,
  emptyMessage = 'Không tìm thấy',
  hintMessage = 'Gõ để tìm',
  clearable = true,
  disabled = false,
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery || selectedLabel || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQ = useDebounce(query.trim(), 300);
  const fetchRef = useRef(fetchOptions);
  fetchRef.current = fetchOptions;

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (selectedLabel && !open) setQuery(selectedLabel);
  }, [selectedLabel, open]);

  useEffect(() => {
    if (!open) return;
    if (debouncedQ.length < minChars) {
      setOptions([]);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRef.current(debouncedQ);
        if (!cancelled) {
          setOptions(Array.isArray(data) ? data : []);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, open, minChars]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const pick = (item) => {
    onSelect(item);
    setQuery(getOptionLabel(item));
    setOpen(false);
  };

  const clear = () => {
    setQuery('');
    onSelect(null);
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open || options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pick(options[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showClear = clearable && (query || valueId);

  return (
    <div className="flower-combobox" ref={wrapRef}>
      <div className="flower-combobox-input-wrap">
        <input
          type="text"
          className="flower-combobox-input"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (valueId) onSelect(null);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {showClear && (
          <button type="button" className="flower-combobox-clear" onClick={clear} aria-label="Xóa">
            ×
          </button>
        )}
      </div>
      {open && (
        <ul id={listId} className="flower-combobox-list" role="listbox">
          {loading && <li className="flower-combobox-hint">Đang tìm...</li>}
          {!loading && options.length === 0 && (
            <li className="flower-combobox-hint">
              {debouncedQ.length < minChars
                ? hintMessage
                : emptyMessage}
            </li>
          )}
          {!loading &&
            options.map((item, i) => (
              <li key={getOptionKey(item)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={String(getOptionKey(item)) === String(valueId)}
                  className={`flower-combobox-option ${i === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => pick(item)}
                >
                  {renderOption ? renderOption(item) : getOptionLabel(item)}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
