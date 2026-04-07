import { memo } from 'react';
import type { Block } from '@/types/builder';
import { BLOCK_TYPE_LABELS } from '@/types/builder';

interface BlockRendererProps {
  block: Block;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  dropPosition: 'before' | 'after' | null;
}

function BlockRendererInner({
  block,
  index,
  isSelected,
  isHovered,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dropPosition,
}: BlockRendererProps) {
  const handleMoveDownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveDown(index);
  };

  return (
    <div
      className={`builder-canvas-block ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${dropPosition ? `drop-${dropPosition}` : ''}`}
      onClick={() => onSelect(block.id)}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <div className="block-header">
        <span className="block-type-badge">{BLOCK_TYPE_LABELS[block.type]}</span>
        <div className="block-actions">
          {index > 0 && (
            <button className="block-action-btn" onClick={(e) => { e.stopPropagation(); onMoveUp(index); }} title="Move up" type="button">
              ↑
            </button>
          )}
          <button className="block-action-btn" onClick={handleMoveDownClick} title="Move down" type="button">
            ↓
          </button>
          <button className="block-action-btn" onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }} title="Duplicate" type="button">
            ⧉
          </button>
          <button className="block-action-btn block-action-btn--delete" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} title="Delete" type="button">
            ×
          </button>
        </div>
      </div>
      <div className="block-content">{renderPreview(block)}</div>
    </div>
  );
}

function renderPreview(block: Block) {
  switch (block.type) {
    case 'heading':
      return (
        <span className="block-preview-text">
          <strong>{(block as any).content}</strong>
        </span>
      );
    case 'text':
      return <span className="block-preview-text">{(block as any).content}</span>;
    case 'image':
      return (
        <div className="block-preview-image">
          <span>🖼 Image: {(block as any).alt}</span>
        </div>
      );
    case 'button':
      return (
        <span className="block-preview-button">
          {(block as any).content}
        </span>
      );
    case 'link':
      return (
        <span className="block-preview-link">
          🔗 {(block as any).content}
        </span>
      );
    case 'divider':
      return <div className="block-preview-divider" />;
    case 'spacer':
      return (
        <div className="block-preview-spacer">
          ↕ {(block as any).height}px
        </div>
      );
    case 'columns':
      return (
        <div className="block-preview-columns">
          <span>⫼ {(block as any).count} Columns</span>
        </div>
      );
    default:
      return null;
  }
}

export const BlockRenderer = memo(BlockRendererInner);
