import React from 'react';
import { DocumentSectionHeader } from '../../shared/DocumentSectionHeader';
import type { ZClauseCategoryData } from '../types';
import { ZClauseCard } from './ZClauseCard';

interface CategorySectionProps {
  category: ZClauseCategoryData;
  /** Sequential category number shown in the header badge (1, 2, 3, …). */
  number: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ category, number }) => {
  if (category.clauses.length === 0) return null;

  return (
    <section className="space-y-3">
      <DocumentSectionHeader number={number} title={category.title} />
      <div className="space-y-3">
        {category.clauses.map((clause) => (
          <ZClauseCard
            key={`${category.id}-${clause.number}-${clause.title}`}
            number={clause.number}
            title={clause.title}
            description={clause.description}
            typeLabel={clause.typeLabel}
            page={clause.page}
            impact={clause.impact}
          />
        ))}
      </div>
    </section>
  );
};
