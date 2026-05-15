import "./CollectionFilterTabs.css";
import { useLanguage } from "../../../contexts/useLanguage";

export default function CollectionFilterTabs({ filters, activeFilter, onChange }) {
  const { t } = useLanguage();
  return (
    <div className="collection-filter-tabs" role="tablist" aria-label={t("collection.filterTabsLabel")}>
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
