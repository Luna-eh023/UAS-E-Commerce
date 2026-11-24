type CategoryListProps = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

const CATEGORIES = [
  "Semua",
  "Audio",
  "Aksesoris",
  "Komputer",
  "Elektronik",
];

export default function CategoryList({
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <section className="mb-4">
      <h4 className="fw-bold mb-3">Kategori</h4>

      <div className="d-flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`btn rounded-pill px-4 ${
              selectedCategory === category
                ? "btn-success"
                : "btn-outline-success"
            }`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}