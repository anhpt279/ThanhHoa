import { useEffect, useId, useRef, useState } from 'react';
import { api } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import './FlowerCombobox.css';

export default function FlowerCombobox({
  value,
  onChange,
  selectedLabel = '',
  excludeIds = [],
  placeholder = 'Gõ để tìm loại hoa...',
  required = false,
  disabled = false,
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedLabel || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQ = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (selectedLabel && !open) {
      setQuery(selectedLabel);
    }
  }, [selectedLabel, open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = debouncedQ ? `?q=${encodeURIComponent(debouncedQ)}` : '';
        const data = await api(`/flowers${params}`);
        if (!cancelled) {
          const exclude = new Set(excludeIds.map(String));
          setOptions(data.filter((f) => !exclude.has(String(f._id))));
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
  }, [debouncedQ, open, excludeIds]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const pick = (flower) => {
    onChange(flower._id, flower.flowerName);
    setQuery(flower.flowerName);
    setOpen(false);
  };

  const clear = () => {
    onChange('', '');
    setQuery('');
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

  return (
    <div className="flower-combobox" ref={wrapRef}>
      <div className="flower-combobox-input-wrap">
        <input
          type="text"
          className="flower-combobox-input"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange('', '');
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {value && (
          <button type="button" className="flower-combobox-clear" onClick={clear} aria-label="Xóa chọn">
            ×
          </button>
        )}
      </div>
      {open && (
        <ul id={listId} className="flower-combobox-list" role="listbox">
          {loading && <li className="flower-combobox-hint">Đang tìm...</li>}
          {!loading && options.length === 0 && (
            <li className="flower-combobox-hint">
              {debouncedQ ? 'Không tìm thấy loại hoa' : 'Gõ tên hoa để tìm'}
            </li>
          )}
          {!loading &&
            options.map((f, i) => (
              <li key={f._id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={String(f._id) === String(value)}
                  className={`flower-combobox-option ${i === activeIndex ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => pick(f)}
                >
                  {f.flowerName}
                </button>
              </li>
            ))}
        </ul>
      )}
      {value && <input type="hidden" value={value} required={required} readOnly />}
    </div>
  );
}
