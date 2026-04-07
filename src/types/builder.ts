export type BlockType =
  | 'text'
  | 'heading'
  | 'image'
  | 'button'
  | 'link'
  | 'divider'
  | 'spacer'
  | 'columns';

export type TextAlign = 'left' | 'center' | 'right';
export type HeadingLevel = 1 | 2 | 3;
export type ColumnCount = 1 | 2 | 3;

export interface BlockPath {
  blockId: string;
  columnIndex?: number;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  styles?: BlockStyles;
}

export interface BlockStyles {
  backgroundColor?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  borderRadius?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginAuto?: boolean;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  styles?: BlockStyles & {
    fontSize?: number;
    lineHeight?: number;
    textAlign?: TextAlign;
    color?: string;
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  level: HeadingLevel;
  styles?: BlockStyles & {
    fontSize?: number;
    textAlign?: TextAlign;
    color?: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  styles?: BlockStyles & {
    width?: number;
    height?: number;
    textAlign?: TextAlign;
  };
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  content: string;
  href: string;
  styles?: BlockStyles & {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    textAlign?: TextAlign;
    fullWidth?: boolean;
  };
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  content: string;
  href: string;
  styles?: BlockStyles & {
    fontSize?: number;
    color?: string;
    textAlign?: TextAlign;
    underline?: boolean;
  };
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  styles?: BlockStyles & {
    color?: string;
    thickness?: number;
    width?: number;
  };
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: number;
}

export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  count: ColumnCount;
  children: Block[][];
  styles?: BlockStyles & {
    gap?: number;
  };
}

export type Block =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | ButtonBlock
  | LinkBlock
  | DividerBlock
  | SpacerBlock
  | ColumnsBlock;

export interface EmailBuilderData {
  blocks: Block[];
  globalStyles?: {
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;
  };
}

export interface DragState {
  draggedBlockId: string | null;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | null;
}

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  text: 'Text',
  heading: 'Heading',
  image: 'Image',
  button: 'Button',
  link: 'Link',
  divider: 'Divider',
  spacer: 'Spacer',
  columns: 'Columns',
};

export const BLOCK_TYPE_ICONS: Record<BlockType, string> = {
  text: 'T',
  heading: 'H',
  image: '🖼',
  button: '☐',
  link: '🔗',
  divider: '—',
  spacer: '↕',
  columns: '⫼',
};
