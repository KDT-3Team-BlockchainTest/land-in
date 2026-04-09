import "./CollectionFilterTabs.css";

export default function CollectionFilterTabs({ filters, activeFilter, onChange }) {
  return (
    <div className="collection-filter-tabs" role="tablist" aria-label="컬렉션 필터">
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;

        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            className={[
              "collection-filter-tabs__button",
              isActive ? "is-active" : "",
            ]
              .join(" ")
              .trim()}
            aria-selected={isActive}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
