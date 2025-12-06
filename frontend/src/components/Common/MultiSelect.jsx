// components/Common/MultiSelect.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import styles from './MultiSelect.module.css';

const MultiSelect = ({
  label,
  placeholder = 'Select options',
  values = [],      // array of selected value (id)
  options = [],     // [{ value, label }]
  onChange,
  disabled = false,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggleOption = (value) => {
    if (disabled) return;

    if (values.includes(value)) {
      // Hapus item ini saja
      onChange(values.filter((v) => v !== value));
    } else {
      // Tambah item ini, bukan semua
      onChange([...values, value]);
    }
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions[0].label} +${selectedOptions.length - 1} more`;

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <button
        type="button"
        className={`${styles.control} ${
          disabled ? styles.disabled : ''
        } ${error ? styles.error : ''}`}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span
          className={
            selectedOptions.length ? styles.value : styles.placeholder
          }
        >
          {displayText}
        </span>

        <div className={styles.rightIcons}>
          {selectedOptions.length > 0 && !disabled && (
            <X
              size={14}
              className={styles.clearIcon}
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
            />
          )}
          <ChevronDown size={18} className={styles.icon} />
        </div>
      </button>

      {error && <p className={styles.errorText}>{error}</p>}

      {open && !disabled && (
        <div className={styles.dropdown}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search genre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.options}>
            {filteredOptions.length === 0 ? (
              <div className={styles.empty}>No genres found</div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = values.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    className={`${styles.option} ${
                      checked ? styles.optionSelected : ''
                    }`}
                    onClick={() => toggleOption(opt.value)}
                  >
                    <div className={styles.checkbox}>
                      {checked && <Check size={14} />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
