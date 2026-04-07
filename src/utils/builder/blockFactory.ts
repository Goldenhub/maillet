import type {
  Block,
  ColumnsBlock,
  BlockType,
  EmailBuilderData,
  HeadingLevel,
  ColumnCount,
} from '@/types/builder';

let idCounter = 0;

function generateId(): string {
  return `block-${Date.now()}-${++idCounter}`;
}

function createBaseBlock(type: BlockType): Pick<Block, 'id' | 'type'> {
  return { id: generateId(), type };
}

export function createBlock(type: BlockType): Block {
  const base = createBaseBlock(type);
  switch (type) {
    case 'text':
      return { ...base, type: 'text' as const, content: 'Enter your text here...' };
    case 'heading':
      return { ...base, type: 'heading' as const, content: 'Heading', level: 2 as HeadingLevel };
    case 'image':
      return { ...base, type: 'image' as const, src: 'https://via.placeholder.com/600x200', alt: 'Placeholder image' };
    case 'button':
      return { ...base, type: 'button' as const, content: 'Click Here', href: 'https://example.com' };
    case 'link':
      return { ...base, type: 'link' as const, content: 'Click here to learn more', href: 'https://example.com' };
    case 'divider':
      return { ...base, type: 'divider' as const };
    case 'spacer':
      return { ...base, type: 'spacer' as const, height: 20 };
    case 'columns':
      return { ...base, type: 'columns' as const, count: 2 as ColumnCount, children: [[], []] };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

export function createDefaultBuilderData(): EmailBuilderData {
  return {
    blocks: [],
    globalStyles: {
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      color: '#333333',
    },
  };
}

export function updateBlock<T extends Block>(block: T, updates: Partial<T>): T {
  return { ...block, ...updates };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function findBlockInTree(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.type === 'columns') {
      for (const col of (block as ColumnsBlock).children) {
        const found = findBlockInTree(col, id);
        if (found) return found;
      }
    }
  }
  return null;
}

function removeBlockFromTree(blocks: Block[], blockId: string): Block[] {
  return blocks
    .filter((b) => b.id !== blockId)
    .map((b) => {
      if (b.type === 'columns') {
        return {
          ...b,
          children: (b as ColumnsBlock).children.map((col) => removeBlockFromTree(col, blockId)),
        };
      }
      return b;
    });
}

function updateBlockInTree(blocks: Block[], blockId: string, updatedBlock: Block): Block[] {
  return blocks.map((b) => {
    if (b.id === blockId) return updatedBlock;
    if (b.type === 'columns') {
      return {
        ...b,
        children: (b as ColumnsBlock).children.map((col) => updateBlockInTree(col, blockId, updatedBlock)),
      };
    }
    return b;
  });
}

function updateColumnArray(blocks: Block[], parentId: string, colIndex: number, newBlocks: Block[]): Block[] {
  return blocks.map((b) => {
    if (b.id === parentId && b.type === 'columns') {
      const cols = (b as ColumnsBlock).children.map((c) => [...c]);
      cols[colIndex] = newBlocks;
      return { ...b, children: cols };
    }
    if (b.type === 'columns') {
      return {
        ...b,
        children: (b as ColumnsBlock).children.map((col) => updateColumnArray(col, parentId, colIndex, newBlocks)),
      };
    }
    return b;
  });
}

export function insertBlock(data: EmailBuilderData, index: number, block: Block): EmailBuilderData {
  const newBlocks = [...data.blocks];
  newBlocks.splice(index, 0, block);
  return { ...data, blocks: newBlocks };
}

export function insertBlockInColumn(data: EmailBuilderData, parentId: string, colIndex: number, index: number, block: Block): EmailBuilderData {
  const parent = findBlockInTree(data.blocks, parentId);
  if (!parent || parent.type !== 'columns') return data;

  const newBlocks = deepClone(data.blocks);
  const newParent = findBlockInTree(newBlocks, parentId) as ColumnsBlock;
  newParent.children[colIndex].splice(index, 0, block);
  return { ...data, blocks: newBlocks };
}

export function removeBlock(data: EmailBuilderData, blockId: string): EmailBuilderData {
  return { ...data, blocks: removeBlockFromTree(data.blocks, blockId) };
}

export function moveBlock(
  data: EmailBuilderData,
  fromParentId: string | null,
  fromColIndex: number | null,
  fromIndex: number,
  toParentId: string | null,
  toColIndex: number | null,
  toIndex: number
): EmailBuilderData {
  const newBlocks = deepClone(data.blocks);

  let fromArr: Block[] | null = null;
  if (!fromParentId) {
    fromArr = newBlocks;
  } else {
    const parent = findBlockInTree(newBlocks, fromParentId);
    if (parent?.type === 'columns' && fromColIndex !== null) {
      fromArr = (parent as ColumnsBlock).children[fromColIndex];
    }
  }
  if (!fromArr) return data;

  const [moved] = fromArr.splice(fromIndex, 1);

  let toArr: Block[] | null = null;
  if (!toParentId) {
    toArr = newBlocks;
  } else {
    const parent = findBlockInTree(newBlocks, toParentId);
    if (parent?.type === 'columns' && toColIndex !== null) {
      toArr = (parent as ColumnsBlock).children[toColIndex];
    }
  }
  if (!toArr) return data;

  toArr.splice(toIndex, 0, moved);
  return { ...data, blocks: newBlocks };
}

export function duplicateBlock(data: EmailBuilderData, blockId: string): EmailBuilderData {
  const newBlocks = deepClone(data.blocks);

  function findAndDup(blocks: Block[]): boolean {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === blockId) {
        const dup = deepClone(blocks[i]);
        dup.id = `block-${Date.now()}-${++idCounter}`;
        if (dup.type === 'columns') {
          const reassign = (b: Block[]): Block[] =>
            b.map((x) => {
              const nb = { ...x, id: `block-${Date.now()}-${++idCounter}` };
              if (nb.type === 'columns') nb.children = (nb as ColumnsBlock).children.map(reassign);
              return nb;
            });
          (dup as ColumnsBlock).children = (dup as ColumnsBlock).children.map(reassign);
        }
        blocks.splice(i + 1, 0, dup);
        return true;
      }
      if (blocks[i].type === 'columns') {
        for (const col of (blocks[i] as ColumnsBlock).children) {
          if (findAndDup(col)) return true;
        }
      }
    }
    return false;
  }

  findAndDup(newBlocks);
  return { ...data, blocks: newBlocks };
}

export function updateBlockInTreeData(data: EmailBuilderData, blockId: string, updatedBlock: Block): EmailBuilderData {
  return { ...data, blocks: updateBlockInTree(data.blocks, blockId, updatedBlock) };
}

export function updateColumnBlocks(data: EmailBuilderData, parentId: string, colIndex: number, newColBlocks: Block[]): EmailBuilderData {
  return { ...data, blocks: updateColumnArray(data.blocks, parentId, colIndex, newColBlocks) };
}

export function updateGlobalStyles(data: EmailBuilderData, updates: Partial<NonNullable<EmailBuilderData['globalStyles']>>): EmailBuilderData {
  return { ...data, globalStyles: { ...data.globalStyles, ...updates } };
}
