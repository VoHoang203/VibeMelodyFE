import { Card } from "@/components/ui/card"
import { GripVertical, Music, X } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableTrackItem({ track, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 cursor-move hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="shrink-0 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="shrink-0 w-8 text-center">
            <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
          </div>

          <div className="shrink-0">
            {track.imageUrl.includes("placeholder") ? (
              <div className="h-12 w-12 rounded bg-secondary flex items-center justify-center">
                <Music className="h-5 w-5 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={track.imageUrl || "/placeholder.svg"}
                alt={track.name}
                className="h-12 w-12 rounded object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{track.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          </div>

          <div className="shrink-0">
            <span className="text-sm text-muted-foreground font-mono">{formatDuration(track.duration)}</span>
          </div>

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(track.id)
              }}
              className="shrink-0 p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
              title="Remove from album"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}

export function AlbumTrackList({ tracks, onReorder, onRemove }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((track) => track.id === active.id)
      const newIndex = tracks.findIndex((track) => track.id === over.id)

      onReorder(arrayMove(tracks, oldIndex, newIndex))
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tracks} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <SortableTrackItem key={track.id} track={track} index={index} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
