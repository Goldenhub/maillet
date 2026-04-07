import { useState, useCallback, useRef } from 'react';
import type { Block, ColumnsBlock, EmailBuilderData } from '@/types/builder';
import { BlockRenderer } from '@/components/BlockRenderer';
import { moveBlock, insertBlockInColumn, createBlock } from '@/utils/builder';
import type { BlockType } from '@/types/builder';

interface BuilderCanvasProps {
  data: EmailBuilderData;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDataChange: (data: EmailBuilderData) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
}

interface DragInfo {
  parentId: string | null;
  colIndex: number | null;
  index: number;
}

interface DropTarget {
  parentId: string | null;
  colIndex: number | null;
  blockIndex: number;
  position: 'before' | 'after';
}

export function BuilderCanvas({
  data,
  selectedBlockId,
  onSelectBlock,
  onDataChange,
  onDeleteBlock,
  onDuplicateBlock,
}: BuilderCanvasProps) {
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef(data);
  const onDataChangeRef = useRef(onDataChange);
  const dragInfoRef = useRef<DragInfo | null>(null);
  const dropTargetRef = useRef<DropTarget | null>(null);
  dataRef.current = data;
  onDataChangeRef.current = onDataChange;

  const makeDragStart = useCallback((parentId: string | null, colIndex: number | null, index: number) => {
    return (e: React.DragEvent) => {
      const info = { parentId, colIndex, index };
      setDragInfo(info);
      dragInfoRef.current = info;
      e.dataTransfer.effectAllowed = 'move';
    };
  }, []);

  const makeBlockDragOver = useCallback((parentId: string | null, colIndex: number | null, index: number) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const target = { parentId, colIndex, blockIndex: index, position: e.clientY < midY ? 'before' : 'after' as 'before' | 'after' };
      setDropTarget(target);
      dropTargetRef.current = target;
    };
  }, []);

  const makeColumnDragOver = useCallback((parentId: string, colIndex: number) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      const target = { parentId, colIndex, blockIndex: -1, position: 'before' as const };
      setDropTarget(target);
      dropTargetRef.current = target;
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    const currentDrag = dragInfoRef.current;
    const currentDrop = dropTargetRef.current;

    if (blockType) {
      const newBlock = createBlock(blockType);
      if (currentDrop && currentDrop.colIndex !== null && currentDrop.parentId) {
        const newData = insertBlockInColumn(dataRef.current, currentDrop.parentId, currentDrop.colIndex, 0, newBlock);
        onDataChangeRef.current(newData);
      } else {
        onDataChangeRef.current({
          ...dataRef.current,
          blocks: [...dataRef.current.blocks, newBlock],
        });
      }
    } else if (currentDrag && currentDrop) {
      const toIndex = currentDrop.position === 'after' ? currentDrop.blockIndex + 1 : currentDrop.blockIndex;
      const newData = moveBlock(
        dataRef.current,
        currentDrag.parentId,
        currentDrag.colIndex,
        currentDrag.index,
        currentDrop.parentId,
        currentDrop.colIndex,
        toIndex
      );
      onDataChangeRef.current(newData);
    }

    setDragInfo(null);
    setDropTarget(null);
    dragInfoRef.current = null;
    dropTargetRef.current = null;
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragInfo(null);
    setDropTarget(null);
    dragInfoRef.current = null;
    dropTargetRef.current = null;
  }, []);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleMoveUp = useCallback((parentId: string | null, colIndex: number | null, index: number) => {
    if (index === 0) return;
    const newData = moveBlock(dataRef.current, parentId, colIndex, index, parentId, colIndex, index - 1);
    onDataChangeRef.current(newData);
  }, []);

  const handleMoveDown = useCallback((parentId: string | null, colIndex: number | null, index: number, total: number) => {
    if (index >= total - 1) return;
    const newData = moveBlock(dataRef.current, parentId, colIndex, index, parentId, colIndex, index + 1);
    onDataChangeRef.current(newData);
  }, []);

  const handleSelectBlock = useCallback(
    (id: string) => {
      onSelectBlock(selectedBlockId === id ? null : id);
    },
    [onSelectBlock, selectedBlockId]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('builder-canvas-empty')) {
        onSelectBlock(null);
      }
    },
    [onSelectBlock]
  );

  const renderColumnZone = (parentId: string, colIndex: number, colBlocks: Block[]) => {
    return (
      <div
        key={`${parentId}-col-${colIndex}`}
        className={`builder-column ${colBlocks.length === 0 ? 'builder-column--empty' : ''}`}
        onDrop={handleDrop}
        onDragOver={makeColumnDragOver(parentId, colIndex)}
      >
        {colBlocks.length === 0 ? (
          <div className="builder-column-empty">
            <span>Drop blocks here</span>
          </div>
        ) : (
          colBlocks.map((block, index) => {
            const isDropTarget =
              dropTarget?.parentId === parentId &&
              dropTarget?.colIndex === colIndex &&
              dropTarget?.blockIndex === index;
            const currentDropPosition = isDropTarget ? dropTarget?.position ?? null : null;

            return (
              <BlockRenderer
                key={block.id}
                block={block}
                index={index}
                isSelected={selectedBlockId === block.id}
                isHovered={dragInfo !== null}
                onSelect={handleSelectBlock}
                onDelete={onDeleteBlock}
                onDuplicate={onDuplicateBlock}
                onMoveUp={() => handleMoveUp(parentId, colIndex, index)}
                onMoveDown={() => handleMoveDown(parentId, colIndex, index, colBlocks.length)}
                onDragStart={makeDragStart(parentId, colIndex, index)}
                onDragOver={makeBlockDragOver(parentId, colIndex, index)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                dropPosition={currentDropPosition}
              />
            );
          })
        )}
      </div>
    );
  };

  if (data.blocks.length === 0) {
    return (
      <div
        ref={canvasRef}
        className="builder-canvas builder-canvas--empty"
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleCanvasDragOver}
      >
        <div className="builder-canvas-empty">
          <div className="builder-canvas-empty-icon">+</div>
          <h3>Start building your email</h3>
          <p>Drag blocks here or click them in the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="builder-canvas"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleCanvasDragOver}
    >
      {data.blocks.map((block, index) => {
        if (block.type === 'columns') {
          const columnsBlock = block as ColumnsBlock;
          const isDropTarget = dropTarget?.parentId === null && dropTarget?.colIndex === null && dropTarget?.blockIndex === index;
          const currentDropPosition = isDropTarget ? dropTarget?.position ?? null : null;

          return (
            <div key={block.id} className="builder-canvas-block-wrapper">
              <BlockRenderer
                block={block}
                index={index}
                isSelected={selectedBlockId === block.id}
                isHovered={false}
                onSelect={handleSelectBlock}
                onDelete={onDeleteBlock}
                onDuplicate={onDuplicateBlock}
                onMoveUp={() => handleMoveUp(null, null, index)}
                onMoveDown={() => handleMoveDown(null, null, index, data.blocks.length)}
                onDragStart={makeDragStart(null, null, index)}
                onDragOver={makeBlockDragOver(null, null, index)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                dropPosition={currentDropPosition}
              />
              <div className="builder-columns-container">
                {columnsBlock.children.map((colBlocks, ci) =>
                  renderColumnZone(columnsBlock.id, ci, colBlocks)
                )}
              </div>
            </div>
          );
        }

        const isDropTarget = dropTarget?.parentId === null && dropTarget?.colIndex === null && dropTarget?.blockIndex === index;
        const currentDropPosition = isDropTarget ? dropTarget?.position ?? null : null;

        return (
          <BlockRenderer
            key={block.id}
            block={block}
            index={index}
            isSelected={selectedBlockId === block.id}
            isHovered={dragInfo !== null && dragInfo.index !== index}
            onSelect={handleSelectBlock}
            onDelete={onDeleteBlock}
            onDuplicate={onDuplicateBlock}
            onMoveUp={() => handleMoveUp(null, null, index)}
            onMoveDown={() => handleMoveDown(null, null, index, data.blocks.length)}
            onDragStart={makeDragStart(null, null, index)}
            onDragOver={makeBlockDragOver(null, null, index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            dropPosition={currentDropPosition}
          />
        );
      })}
    </div>
  );
}
