import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ConfigItemRow } from './ConfigItem'
import type { ConfigItem } from '@/types'

interface Props {
  item: ConfigItem
  index: number
  total: number
  onUpdate: (id: string, field: 'title' | 'dir' | 'command', value: string) => void
  onRemove: (id: string) => void
}

export function SortableItem({ item, index, total, onUpdate, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ConfigItemRow
        item={item}
        index={index}
        total={total}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
