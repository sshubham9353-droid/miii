import type { BackgroundMode } from '@/types';

export default function OceanBackground({
  mode = 'modern-grey',
}: {
  mode?: BackgroundMode;
}) {
  if (mode !== 'galaxy') return <div className="theme-backdrop" aria-hidden="true" />;
  return (
    <div className="theme-backdrop galaxy-backdrop" aria-hidden="true">
      <div className="galaxy-nebula galaxy-nebula-one" />
      <div className="galaxy-nebula galaxy-nebula-two" />
      <div className="galaxy-stars" />
    </div>
  );
}
