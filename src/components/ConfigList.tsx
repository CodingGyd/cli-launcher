import { useConfigStore } from '@/stores/useConfigStore'
import { SortableItem } from './SortableItem'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Terminal } from 'lucide-react'

export function ConfigList() {
  const { items, removeItem, updateItem, reorderItems } = useConfigStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/60 gap-3">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
          <Terminal className="size-7 opacity-50" />
        </div>
        <div className="text-sm">暂无配置</div>
        <div className="text-xs opacity-70">
          点击上方「添加」按钮，配置你的项目启动项
        </div>
      </div>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderItems(active.id as string, over.id as string)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
          gap: 24,
          alignContent: 'start',
          background: 'var(--muted)',
        }}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
