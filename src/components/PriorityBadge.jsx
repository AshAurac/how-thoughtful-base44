const configs = {
  free: { label: 'Free', className: 'bg-moss/20 text-moss-dark' },
  low: { label: 'Low', className: 'bg-sand-200 text-ink-soft' },
  medium: { label: 'Medium', className: 'bg-butter/40 text-butter-dark' },
  high: { label: 'High', className: 'bg-terracotta/20 text-terracotta-dark' },
};

export default function PriorityBadge({ priority }) {
  const config = configs[priority] || configs.medium;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}