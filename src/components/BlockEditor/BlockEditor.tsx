import { useState, useEffect, useCallback } from 'react';
import type {
  Block,
  TextBlock,
  HeadingBlock,
  ImageBlock,
  ButtonBlock,
  LinkBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  EmailBuilderData,
  TextAlign,
  HeadingLevel,
  ColumnCount,
} from '@/types/builder';
import { updateBlock, updateGlobalStyles } from '@/utils/builder';

interface BlockEditorProps {
  block: Block | null;
  data: EmailBuilderData;
  onUpdateBlock: (block: Block) => void;
  onUpdateGlobalStyles: (data: EmailBuilderData) => void;
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="block-editor-field">
      <label className="block-editor-label">{label}</label>
      <div className="block-editor-color-row">
        <input
          type="color"
          value={value ?? '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="block-editor-color-picker"
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="block-editor-input"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="block-editor-field">
      <label className="block-editor-label">{label}</label>
      <div className="block-editor-number-row">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block-editor-input"
          min={min}
          max={max}
        />
        {suffix && <span className="block-editor-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="block-editor-field">
      <label className="block-editor-label">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block-editor-textarea"
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block-editor-input"
        />
      )}
    </div>
  );
}

function CheckboxInput({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="block-editor-field">
      <label className="block-editor-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
}

function PaddingEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  const styles = block.styles ?? {};
  return (
    <div className="block-editor-section">
      <h4 className="block-editor-section-title">Padding</h4>
      <div className="block-editor-padding-grid">
        <NumberInput
          label="Top"
          value={styles.paddingTop}
          onChange={(v) => onUpdate({ styles: { ...styles, paddingTop: v } })}
          min={0}
          suffix="px"
        />
        <NumberInput
          label="Right"
          value={styles.paddingRight}
          onChange={(v) => onUpdate({ styles: { ...styles, paddingRight: v } })}
          min={0}
          suffix="px"
        />
        <NumberInput
          label="Bottom"
          value={styles.paddingBottom}
          onChange={(v) => onUpdate({ styles: { ...styles, paddingBottom: v } })}
          min={0}
          suffix="px"
        />
        <NumberInput
          label="Left"
          value={styles.paddingLeft}
          onChange={(v) => onUpdate({ styles: { ...styles, paddingLeft: v } })}
          min={0}
          suffix="px"
        />
      </div>
    </div>
  );
}

function MarginEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  const styles = block.styles ?? {};
  return (
    <div className="block-editor-section">
      <h4 className="block-editor-section-title">Margin</h4>
      <div className="block-editor-padding-grid">
        <NumberInput
          label="Top"
          value={styles.marginTop}
          onChange={(v) => onUpdate({ styles: { ...styles, marginTop: v } })}
          min={0}
          suffix="px"
        />
        <NumberInput
          label="Right"
          value={styles.marginRight}
          onChange={(v) => onUpdate({ styles: { ...styles, marginRight: v } })}
          min={0}
          suffix="px"
        />
        <NumberInput
          label="Bottom"
          value={styles.marginBottom}
          onChange={(v) => onUpdate({ styles: { ...styles, marginBottom: v } })}
          min={0}
          suffix="px"
        />
        <NumberInput
          label="Left"
          value={styles.marginLeft}
          onChange={(v) => onUpdate({ styles: { ...styles, marginLeft: v } })}
          min={0}
          suffix="px"
        />
      </div>
      <CheckboxInput
        label="Auto horizontal (center)"
        checked={styles.marginAuto ?? false}
        onChange={(v) => onUpdate({ styles: { ...styles, marginAuto: v } })}
      />
    </div>
  );
}

function renderTextEditor(block: TextBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <TextInput
        label="Content"
        value={block.content}
        onChange={(v) => onUpdate({ content: v })}
        multiline
      />
      <div className="block-editor-field">
        <label className="block-editor-label">Alignment</label>
        <select
          value={block.styles?.textAlign ?? 'left'}
          onChange={(e) => onUpdate({ styles: { ...block.styles, textAlign: e.target.value as TextAlign } })}
          className="block-editor-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <NumberInput
        label="Font Size"
        value={block.styles?.fontSize}
        onChange={(v) => onUpdate({ styles: { ...block.styles, fontSize: v } })}
        min={8}
        max={72}
        suffix="px"
      />
      <ColorInput
        label="Color"
        value={block.styles?.color}
        onChange={(v) => onUpdate({ styles: { ...block.styles, color: v } })}
      />
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

function renderHeadingEditor(block: HeadingBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <TextInput
        label="Content"
        value={block.content}
        onChange={(v) => onUpdate({ content: v })}
      />
      <div className="block-editor-field">
        <label className="block-editor-label">Level</label>
        <select
          value={block.level}
          onChange={(e) => onUpdate({ level: Number(e.target.value) as HeadingLevel })}
          className="block-editor-select"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      </div>
      <div className="block-editor-field">
        <label className="block-editor-label">Alignment</label>
        <select
          value={block.styles?.textAlign ?? 'left'}
          onChange={(e) => onUpdate({ styles: { ...block.styles, textAlign: e.target.value as TextAlign } })}
          className="block-editor-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <NumberInput
        label="Font Size"
        value={block.styles?.fontSize}
        onChange={(v) => onUpdate({ styles: { ...block.styles, fontSize: v } })}
        min={12}
        max={72}
        suffix="px"
      />
      <ColorInput
        label="Color"
        value={block.styles?.color}
        onChange={(v) => onUpdate({ styles: { ...block.styles, color: v } })}
      />
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

function renderImageEditor(block: ImageBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <TextInput
        label="Image URL"
        value={block.src}
        onChange={(v) => onUpdate({ src: v })}
      />
      <TextInput
        label="Alt Text"
        value={block.alt}
        onChange={(v) => onUpdate({ alt: v })}
      />
      <NumberInput
        label="Width"
        value={block.styles?.width}
        onChange={(v) => onUpdate({ styles: { ...block.styles, width: v } })}
        min={0}
        suffix="px"
      />
      <NumberInput
        label="Height"
        value={block.styles?.height}
        onChange={(v) => onUpdate({ styles: { ...block.styles, height: v } })}
        min={0}
        suffix="px"
      />
      <div className="block-editor-field">
        <label className="block-editor-label">Alignment</label>
        <select
          value={block.styles?.textAlign ?? 'center'}
          onChange={(e) => onUpdate({ styles: { ...block.styles, textAlign: e.target.value as TextAlign } })}
          className="block-editor-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

function renderButtonEditor(block: ButtonBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <TextInput
        label="Label"
        value={block.content}
        onChange={(v) => onUpdate({ content: v })}
      />
      <TextInput
        label="Link URL"
        value={block.href}
        onChange={(v) => onUpdate({ href: v })}
      />
      <div className="block-editor-field">
        <label className="block-editor-label">Alignment</label>
        <select
          value={block.styles?.textAlign ?? 'center'}
          onChange={(e) => onUpdate({ styles: { ...block.styles, textAlign: e.target.value as TextAlign } })}
          className="block-editor-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <ColorInput
        label="Text Color"
        value={block.styles?.color}
        onChange={(v) => onUpdate({ styles: { ...block.styles, color: v } })}
      />
      <NumberInput
        label="Font Size"
        value={block.styles?.fontSize}
        onChange={(v) => onUpdate({ styles: { ...block.styles, fontSize: v } })}
        min={10}
        max={36}
        suffix="px"
      />
      <CheckboxInput
        label="Full width"
        checked={block.styles?.fullWidth ?? false}
        onChange={(v) => onUpdate({ styles: { ...block.styles, fullWidth: v } })}
      />
      <NumberInput
        label="Border Radius"
        value={block.styles?.borderRadius}
        onChange={(v) => onUpdate({ styles: { ...block.styles, borderRadius: v } })}
        min={0}
        max={50}
        suffix="px"
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

function renderLinkEditor(block: LinkBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <TextInput
        label="Link Text"
        value={block.content}
        onChange={(v) => onUpdate({ content: v })}
      />
      <TextInput
        label="URL"
        value={block.href}
        onChange={(v) => onUpdate({ href: v })}
      />
      <div className="block-editor-field">
        <label className="block-editor-label">Alignment</label>
        <select
          value={block.styles?.textAlign ?? 'left'}
          onChange={(e) => onUpdate({ styles: { ...block.styles, textAlign: e.target.value as TextAlign } })}
          className="block-editor-select"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <ColorInput
        label="Text Color"
        value={block.styles?.color}
        onChange={(v) => onUpdate({ styles: { ...block.styles, color: v } })}
      />
      <NumberInput
        label="Font Size"
        value={block.styles?.fontSize}
        onChange={(v) => onUpdate({ styles: { ...block.styles, fontSize: v } })}
        min={8}
        max={36}
        suffix="px"
      />
      <CheckboxInput
        label="Underline"
        checked={block.styles?.underline ?? true}
        onChange={(v) => onUpdate({ styles: { ...block.styles, underline: v } })}
      />
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

function renderDividerEditor(block: DividerBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <ColorInput
        label="Color"
        value={block.styles?.color}
        onChange={(v) => onUpdate({ styles: { ...block.styles, color: v } })}
      />
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <NumberInput
        label="Thickness"
        value={block.styles?.thickness}
        onChange={(v) => onUpdate({ styles: { ...block.styles, thickness: v } })}
        min={1}
        max={10}
        suffix="px"
      />
      <NumberInput
        label="Width"
        value={block.styles?.width}
        onChange={(v) => onUpdate({ styles: { ...block.styles, width: v } })}
        min={0}
        suffix="px"
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

function renderSpacerEditor(block: SpacerBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <NumberInput
      label="Height"
      value={block.height}
      onChange={(v) => onUpdate({ height: v })}
      min={0}
      max={200}
      suffix="px"
    />
  );
}

function renderColumnsEditor(block: ColumnsBlock, onUpdate: (updates: Partial<Block>) => void) {
  return (
    <>
      <div className="block-editor-field">
        <label className="block-editor-label">Columns</label>
        <select
          value={block.count}
          onChange={(e) => {
            const v = Number(e.target.value) as ColumnCount;
            const newChildren = Array.from({ length: v }, (_, i) => block.children[i] ?? []);
            onUpdate({ count: v, children: newChildren });
          }}
          className="block-editor-select"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>
      <NumberInput
        label="Gap"
        value={block.styles?.gap}
        onChange={(v) => onUpdate({ styles: { ...block.styles, gap: v } })}
        min={0}
        max={40}
        suffix="px"
      />
      <ColorInput
        label="Background Color"
        value={block.styles?.backgroundColor}
        onChange={(v) => onUpdate({ styles: { ...block.styles, backgroundColor: v } })}
      />
      <PaddingEditor block={block} onUpdate={onUpdate} />
      <MarginEditor block={block} onUpdate={onUpdate} />
    </>
  );
}

export function BlockEditor({ block, data, onUpdateBlock, onUpdateGlobalStyles }: BlockEditorProps) {
  const [localBlock, setLocalBlock] = useState<Block | null>(block);

  useEffect(() => {
    if (block && (!localBlock || localBlock.id !== block.id)) {
      setLocalBlock(block);
    }
  }, [block?.id]);

  const commitUpdate = useCallback((updates: Partial<Block>) => {
    setLocalBlock((prev) => {
      if (!prev) return prev;
      const next = updateBlock(prev, updates);
      onUpdateBlock(next);
      return next;
    });
  }, [onUpdateBlock]);

  const handleGlobalStyleChange = useCallback(
    (key: string, value: string | number) => {
      onUpdateGlobalStyles(updateGlobalStyles(data, { [key]: value }));
    },
    [data, onUpdateGlobalStyles]
  );

  if (!localBlock) {
    return (
      <div className="block-editor">
        <h3 className="block-editor-title">Global Styles</h3>
        <div className="block-editor-section">
          <ColorInput
            label="Background Color"
            value={data.globalStyles?.backgroundColor}
            onChange={(v) => handleGlobalStyleChange('backgroundColor', v)}
          />
          <ColorInput
            label="Text Color"
            value={data.globalStyles?.color}
            onChange={(v) => handleGlobalStyleChange('color', v)}
          />
          <NumberInput
            label="Font Size"
            value={data.globalStyles?.fontSize}
            onChange={(v) => handleGlobalStyleChange('fontSize', v)}
            min={8}
            max={36}
            suffix="px"
          />
          <div className="block-editor-field">
            <label className="block-editor-label">Font Family</label>
            <select
              value={data.globalStyles?.fontFamily ?? 'Arial, sans-serif'}
              onChange={(e) => handleGlobalStyleChange('fontFamily', e.target.value)}
              className="block-editor-select"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Tahoma, sans-serif">Tahoma</option>
              <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
            </select>
          </div>
        </div>
        <div className="block-editor-hint">
          Select a block to edit its properties
        </div>
      </div>
    );
  }

  const renderBlockEditor = () => {
    switch (localBlock.type) {
      case 'text':
        return renderTextEditor(localBlock as TextBlock, commitUpdate);
      case 'heading':
        return renderHeadingEditor(localBlock as HeadingBlock, commitUpdate);
      case 'image':
        return renderImageEditor(localBlock as ImageBlock, commitUpdate);
      case 'button':
        return renderButtonEditor(localBlock as ButtonBlock, commitUpdate);
      case 'link':
        return renderLinkEditor(localBlock as LinkBlock, commitUpdate);
      case 'divider':
        return renderDividerEditor(localBlock as DividerBlock, commitUpdate);
      case 'spacer':
        return renderSpacerEditor(localBlock as SpacerBlock, commitUpdate);
      case 'columns':
        return renderColumnsEditor(localBlock as ColumnsBlock, commitUpdate);
      default:
        return null;
    }
  };

  return (
    <div className="block-editor">
      <h3 className="block-editor-title">
        Edit {localBlock.type.charAt(0).toUpperCase() + localBlock.type.slice(1)}
      </h3>
      <div className="block-editor-section">{renderBlockEditor()}</div>
    </div>
  );
}
