import React from 'react';

const ColorPicker = ({ colors, onChange }) => {
  return (
    <div className="space-y-4">
      {Object.entries(colors || {}).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <label className="w-24 text-sm font-medium">{key}</label>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
            className="h-10 w-20"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
            className="border rounded px-2 py-1"
          />
        </div>
      ))}
    </div>
  );
};

export default ColorPicker;