import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, Layers, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useEffectStore } from '@/store/effects'

type EffectStackPanelProps = {
  variant?: 'sidebar' | 'mobile'
  onRequestClose?: () => void
  className?: string
}

export function EffectStackPanel({ variant = 'sidebar', onRequestClose, className }: EffectStackPanelProps) {
  const effects = useEffectStore((state) => state.effects)
  const updateEffectParams = useEffectStore((state) => state.updateEffectParams)
  const toggleEffect = useEffectStore((state) => state.toggleEffect)
  const removeEffect = useEffectStore((state) => state.removeEffect)
  const moveEffect = useEffectStore((state) => state.moveEffect)

  const isMobileVariant = variant === 'mobile'
  const MoveEarlierIcon = isMobileVariant ? ArrowLeft : ArrowUp
  const MoveLaterIcon = isMobileVariant ? ArrowRight : ArrowDown
  const moveEarlierLabel = isMobileVariant ? 'Move effect left' : 'Move effect up'
  const moveLaterLabel = isMobileVariant ? 'Move effect right' : 'Move effect down'

  const emptyState = (
    <div className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/30 p-6 text-center text-sm text-muted-foreground">
      No effects applied yet. Add an effect from the library to get started.
    </div>
  )

  const effectCards = effects.map((effect, index) => {
    const controls = effect.renderControls((params) => {
      updateEffectParams(effect.id, params)
    })

    return (
      <Card
        key={effect.id}
        className={cn('bg-card/70', isMobileVariant ? 'min-w-[260px] flex-shrink-0' : undefined)}
      >
        <CardHeader className={cn('mb-3 flex flex-row items-center justify-between gap-3', isMobileVariant && 'mb-2')}>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">{effect.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{effect.type}</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={effect.isEnabled}
              onCheckedChange={() => toggleEffect(effect.id)}
              aria-label={effect.isEnabled ? 'Disable effect' : 'Enable effect'}
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => moveEffect(effect.id, 'up')}
                disabled={index === 0}
                aria-label={moveEarlierLabel}
              >
                <MoveEarlierIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => moveEffect(effect.id, 'down')}
                disabled={index === effects.length - 1}
                aria-label={moveLaterLabel}
              >
                <MoveLaterIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => removeEffect(effect.id)}
              aria-label="Remove effect"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-4', isMobileVariant && 'space-y-3')}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {effect.isEnabled ? (
              <Eye className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{effect.isEnabled ? 'Active' : 'Disabled'}</span>
            <span className="rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              Step {index + 1}
            </span>
          </div>
          {controls}
        </CardContent>
      </Card>
    )
  })

  const content = (() => {
    if (effects.length === 0) {
      if (isMobileVariant) {
        return <div className="px-3 pb-4">{emptyState}</div>
      }
      return (
        <ScrollArea className="flex-1 px-4 max-h-[50vh] lg:max-h-none">
          {emptyState}
        </ScrollArea>
      )
    }

    if (isMobileVariant) {
      return (
        <div className="px-3 pb-3">
          <PipelineIndicator count={effects.length} />
          <div
            className="mt-3 overflow-x-auto pb-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-3">
              {effectCards}
            </div>
          </div>
        </div>
      )
    }

    return (
      <ScrollArea className="flex-1 px-4 max-h-[50vh] lg:max-h-none">
        <div className="space-y-3 pb-6">{effectCards}</div>
      </ScrollArea>
    )
  })()

  return (
    <div
      className={cn('flex h-full flex-col', isMobileVariant && 'h-auto', className)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <header
        className={cn(
          'mb-4 flex items-center gap-2 px-4',
          isMobileVariant && 'mb-3 justify-between px-3',
        )}
      >
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Effect Stack</p>
            <p className="text-xs text-muted-foreground">Toggle, reorder, and fine-tune applied effects.</p>
          </div>
        </div>
        {isMobileVariant && onRequestClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={onRequestClose}
            aria-label="Close effect controls"
          >
            Done
          </Button>
        )}
      </header>
      {content}
    </div>
  )
}

function PipelineIndicator({ count }: { count: number }) {
  if (count === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
      <span className="font-semibold text-foreground/80">Top</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            {index < count - 1 && <ArrowRight className="h-4 w-4 text-primary/80" strokeWidth={2} />}
          </div>
        ))}
      </div>
      <span className="text-foreground/60">Bottom</span>
    </div>
  )
}
