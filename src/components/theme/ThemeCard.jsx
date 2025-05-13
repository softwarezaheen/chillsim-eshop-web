import React from 'react';

const ThemeCard = ({ theme, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(theme)}
      className={`bg-white p-4 rounded-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <img src={theme.image} alt={theme.name} className="w-full h-48 object-cover rounded" />
      <h3 className="mt-4 text-xl font-semibold">{theme.name}</h3>
      <p className="mt-2 text-gray-600">{theme.description}</p>
    </div>
  );
};

export default ThemeCard;