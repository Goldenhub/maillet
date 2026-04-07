import { describe, it, expect } from 'vitest';
import { compileBuilderJson } from '@/utils/builder/compileBuilderJson';
import { createBlock, createDefaultBuilderData, insertBlock, insertBlockInColumn, removeBlock, moveBlock, duplicateBlock } from '@/utils/builder/blockFactory';
import type { EmailBuilderData, TextBlock, HeadingBlock, ImageBlock, ButtonBlock, DividerBlock, SpacerBlock, ColumnsBlock } from '@/types/builder';

describe('compileBuilderJson', () => {
  it('compiles empty builder data to valid HTML', () => {
    const data = createDefaultBuilderData();
    const result = compileBuilderJson(data);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html');
    expect(result).toContain('<body');
  });

  it('compiles a text block', () => {
    const data = createDefaultBuilderData();
    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = 'Hello World';
    data.blocks = [textBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('<p');
    expect(result).toContain('Hello World');
  });

  it('compiles a heading block', () => {
    const data = createDefaultBuilderData();
    const headingBlock = createBlock('heading') as HeadingBlock;
    headingBlock.content = 'Welcome';
    headingBlock.level = 1;
    data.blocks = [headingBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('<h1');
    expect(result).toContain('Welcome');
  });

  it('compiles an image block', () => {
    const data = createDefaultBuilderData();
    const imageBlock = createBlock('image') as ImageBlock;
    imageBlock.src = 'https://example.com/logo.png';
    imageBlock.alt = 'Logo';
    data.blocks = [imageBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('<img');
    expect(result).toContain('https://example.com/logo.png');
    expect(result).toContain('alt="Logo"');
  });

  it('compiles a button block', () => {
    const data = createDefaultBuilderData();
    const buttonBlock = createBlock('button') as ButtonBlock;
    buttonBlock.content = 'Click Me';
    buttonBlock.href = 'https://example.com';
    data.blocks = [buttonBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('<a');
    expect(result).toContain('Click Me');
    expect(result).toContain('https://example.com');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener"');
  });

  it('compiles a divider block', () => {
    const data = createDefaultBuilderData();
    const dividerBlock = createBlock('divider') as DividerBlock;
    data.blocks = [dividerBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('<hr');
  });

  it('compiles a spacer block', () => {
    const data = createDefaultBuilderData();
    const spacerBlock = createBlock('spacer') as SpacerBlock;
    spacerBlock.height = 40;
    data.blocks = [spacerBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('height="40"');
  });

  it('compiles a columns block', () => {
    const data = createDefaultBuilderData();
    const columnsBlock = createBlock('columns') as ColumnsBlock;
    const col1Text = createBlock('text') as TextBlock;
    col1Text.content = 'Column 1';
    const col2Text = createBlock('text') as TextBlock;
    col2Text.content = 'Column 2';
    columnsBlock.children = [[col1Text], [col2Text]];
    data.blocks = [columnsBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('Column 1');
    expect(result).toContain('Column 2');
    expect(result).toContain('role="presentation"');
  });

  it('compiles columns with nested blocks', () => {
    const data = createDefaultBuilderData();
    const columnsBlock = createBlock('columns') as ColumnsBlock;
    const col1Heading = createBlock('heading') as HeadingBlock;
    col1Heading.content = 'Left Column';
    const col2Text = createBlock('text') as TextBlock;
    col2Text.content = 'Right Column content';
    columnsBlock.children = [[col1Heading], [col2Text]];
    data.blocks = [columnsBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('Left Column');
    expect(result).toContain('Right Column content');
    expect(result).toContain('role="presentation"');
  });

  it('applies global styles', () => {
    const data: EmailBuilderData = {
      blocks: [],
      globalStyles: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'Georgia, serif',
        fontSize: 18,
        color: '#222222',
      },
    };

    const result = compileBuilderJson(data);
    expect(result).toContain('background-color: #f0f0f0');
    expect(result).toContain('font-family: Georgia, serif');
    expect(result).toContain('font-size: 18px');
    expect(result).toContain('color: #222222');
  });

  it('escapes HTML in text content', () => {
    const data = createDefaultBuilderData();
    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = '<script>alert("xss")</script>';
    data.blocks = [textBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('applies block styles', () => {
    const data = createDefaultBuilderData();
    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = 'Styled text';
    textBlock.styles = {
      backgroundColor: '#ff0000',
      color: '#ffffff',
      fontSize: 20,
      textAlign: 'center',
      paddingTop: 10,
      paddingBottom: 10,
    };
    data.blocks = [textBlock];

    const result = compileBuilderJson(data);
    expect(result).toContain('background-color: #ff0000');
    expect(result).toContain('color: #ffffff');
    expect(result).toContain('font-size: 20');
    expect(result).toContain('text-align: center');
  });

  it('includes email meta tags', () => {
    const data = createDefaultBuilderData();
    const result = compileBuilderJson(data);
    expect(result).toContain('charset="utf-8"');
    expect(result).toContain('viewport');
    expect(result).toContain('x-apple-disable-message-reformatting');
    expect(result).toContain('format-detection');
  });

  it('includes MSO conditional comments', () => {
    const data = createDefaultBuilderData();
    const result = compileBuilderJson(data);
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('<o:OfficeDocumentSettings>');
  });

  it('includes preview text placeholder', () => {
    const data = createDefaultBuilderData();
    const result = compileBuilderJson(data);
    expect(result).toContain('&nbsp;&zwnj;');
  });
});

describe('blockFactory', () => {
  it('creates a text block with defaults', () => {
    const block = createBlock('text');
    expect(block.type).toBe('text');
    expect(block.id).toBeDefined();
    expect((block as TextBlock).content).toBe('Enter your text here...');
  });

  it('creates a heading block with defaults', () => {
    const block = createBlock('heading');
    expect(block.type).toBe('heading');
    expect((block as HeadingBlock).level).toBe(2);
    expect((block as HeadingBlock).content).toBe('Heading');
  });

  it('creates columns with 2 empty columns', () => {
    const block = createBlock('columns');
    expect(block.type).toBe('columns');
    expect((block as ColumnsBlock).count).toBe(2);
    expect((block as ColumnsBlock).children).toEqual([[], []]);
  });

  it('inserts a block at specified index', () => {
    const data = createDefaultBuilderData();
    const block1 = createBlock('text');
    const block2 = createBlock('heading');
    const updated = insertBlock(data, 0, block1);
    const updated2 = insertBlock(updated, 0, block2);
    expect(updated2.blocks[0].type).toBe('heading');
    expect(updated2.blocks[1].type).toBe('text');
  });

  it('inserts a block into a column', () => {
    const data = createDefaultBuilderData();
    const columnsBlock = createBlock('columns') as ColumnsBlock;
    data.blocks = [columnsBlock];

    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = 'Col 1 text';
    const updated = insertBlockInColumn(data, columnsBlock.id, 0, 0, textBlock);

    const updatedCols = (updated.blocks[0] as ColumnsBlock).children;
    expect(updatedCols[0].length).toBe(1);
    expect((updatedCols[0][0] as TextBlock).content).toBe('Col 1 text');
    expect(updatedCols[1].length).toBe(0);
  });

  it('removes a block from inside a column', () => {
    const data = createDefaultBuilderData();
    const columnsBlock = createBlock('columns') as ColumnsBlock;
    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = 'Inside column';
    columnsBlock.children[0] = [textBlock];
    data.blocks = [columnsBlock];

    const updated = removeBlock(data, textBlock.id);
    const updatedCols = (updated.blocks[0] as ColumnsBlock).children;
    expect(updatedCols[0].length).toBe(0);
  });

  it('moves a block between columns', () => {
    const data = createDefaultBuilderData();
    const columnsBlock = createBlock('columns') as ColumnsBlock;
    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = 'Move me';
    columnsBlock.children[0] = [textBlock];
    columnsBlock.children[1] = [];
    data.blocks = [columnsBlock];

    const updated = moveBlock(data, columnsBlock.id, 0, 0, columnsBlock.id, 1, 0);
    const updatedCols = (updated.blocks[0] as ColumnsBlock).children;
    expect(updatedCols[0].length).toBe(0);
    expect(updatedCols[1].length).toBe(1);
    expect((updatedCols[1][0] as TextBlock).content).toBe('Move me');
  });

  it('duplicates a block inside a column', () => {
    const data = createDefaultBuilderData();
    const columnsBlock = createBlock('columns') as ColumnsBlock;
    const textBlock = createBlock('text') as TextBlock;
    textBlock.content = 'Duplicate me';
    columnsBlock.children[0] = [textBlock];
    data.blocks = [columnsBlock];

    const updated = duplicateBlock(data, textBlock.id);
    const updatedCols = (updated.blocks[0] as ColumnsBlock).children;
    expect(updatedCols[0].length).toBe(2);
    expect(updatedCols[0][0].id).not.toBe(updatedCols[0][1].id);
    expect((updatedCols[0][1] as TextBlock).content).toBe('Duplicate me');
  });

  it('creates default builder data', () => {
    const data = createDefaultBuilderData();
    expect(data.blocks).toEqual([]);
    expect(data.globalStyles).toBeDefined();
    expect(data.globalStyles?.fontFamily).toBe('Arial, sans-serif');
  });
});
