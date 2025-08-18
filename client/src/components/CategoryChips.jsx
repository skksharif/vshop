import "./CategoryChips.css";

export default function CategoryChips({ categories, selectedCategory, onSelect }) {
  return (
    <div className="categories-chips">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`chip ${selectedCategory === cat.id ? "active" : ""}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
