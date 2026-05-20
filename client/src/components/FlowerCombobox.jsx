import AsyncCombobox from './AsyncCombobox';
import { api } from '../api/client';

export default function FlowerCombobox({
  value,
  onChange,
  selectedLabel = '',
  excludeIds = [],
  placeholder = 'Gõ để tìm loại hoa...',
  required = false,
  disabled = false,
}) {
  const exclude = new Set(excludeIds.map(String));

  return (
    <>
      <AsyncCombobox
        fetchOptions={async (q) => {
          const params = q ? `?q=${encodeURIComponent(q)}` : '';
          const data = await api(`/flowers${params}`);
          return data.filter((f) => !exclude.has(String(f._id)));
        }}
        getOptionKey={(f) => f._id}
        getOptionLabel={(f) => f.flowerName}
        onSelect={(flower) => {
          if (!flower) {
            onChange('', '');
            return;
          }
          onChange(flower._id, flower.flowerName);
        }}
        placeholder={placeholder}
        selectedLabel={selectedLabel}
        valueId={value}
        minChars={0}
        emptyMessage="Không tìm thấy loại hoa"
        hintMessage="Gõ tên hoa để tìm"
        clearable
        disabled={disabled}
      />
      {required && value && <input type="hidden" value={value} required readOnly />}
    </>
  );
}
