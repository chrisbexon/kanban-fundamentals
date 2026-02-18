interface StepHeaderProps {
  tag: string;
  tagColor: string;
  title: string;
  desc?: string;
}

export function StepHeader({ tag, tagColor, title, desc }: StepHeaderProps) {
  return (
    <div className="fade-up mb-4">
      <div className="text-[10px] font-bold uppercase tracking-[2px] mb-1.5" style={{ color: tagColor }}>
        {tag}
      </div>
      <h2 className="text-[clamp(18px,3.5vw,24px)] font-extrabold m-0 mb-1.5 leading-tight" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      {desc && (
        <p className="text-[13px] m-0 leading-relaxed max-w-[700px]" style={{ color: "var(--text-tertiary)" }}>{desc}</p>
      )}
    </div>
  );
}
