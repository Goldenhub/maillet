import { useCallback } from 'react';
import type { BlockType } from '@/types/builder';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS } from '@/types/builder';

interface BuilderSidebarProps {
  onAddBlock: (type: BlockType) => void;
}

const BLOCK_TYPES: BlockType[] = ['heading', 'text', 'image', 'button', 'link', 'divider', 'spacer', 'columns'];

export function BuilderSidebar({ onAddBlock }: BuilderSidebarProps) {
  const handleDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleClick = useCallback((type: BlockType) => {
    onAddBlock(type);
  }, [onAddBlock]);

  return (
    <div className="builder-sidebar">
      <div className="builder-sidebar-header">
        <h3>Blocks</h3>
        <p className="builder-sidebar-hint">Drag or click to add</p>
      </div>
      <div className="builder-sidebar-list">
        {BLOCK_TYPES.map((type) => (
          <div
            key={type}
            className="builder-sidebar-item"
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => handleClick(type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(type);
              }
            }}
          >
            <span className="builder-sidebar-icon">{BLOCK_TYPE_ICONS[type]}</span>
            <span className="builder-sidebar-label">{BLOCK_TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
