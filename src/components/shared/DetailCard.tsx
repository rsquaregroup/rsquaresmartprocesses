import { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface DetailCardProps {
  title: string;
  sections: {
    title?: string;
    items: {
      label: string;
      value: ReactNode;
    }[];
  }[];
  actions?: ReactNode;
}

export function DetailCard({ title, sections, actions }: DetailCardProps) {
  return (
    <GlassCard title={title} headerActions={actions}>
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            {section.title && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {section.title}
              </h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <div className="text-sm font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
