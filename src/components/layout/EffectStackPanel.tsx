import { ArrowDown, ArrowUp, Eye, EyeOff, Layers, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useEffectStore } from '@/store/effects'

export function EffectStackPanel() {
  const effects = useEffectStore((state) => state.effects)
  const updateEffectParams = useEffectStore((state) => state.updateEffectParams)
  const toggleEffect = useEffectStore((state) => state.toggleEffect)
  const removeEffect = useEffectStore((state) => state.removeEffect)
  const moveEffect = useEffectStore((state) => state.moveEffect)

  return (
    <div className="flex h-full flex-col">
      <header className="mb-4 flex items-center gap-2 px-4">
        <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Effect Stack</p>
          <p className="text-xs text-muted-foreground">Toggle, reorder, and fine-tune applied effects.</p>
        </div>
      </header>
      <ScrollArea className="flex-1 px-4 max-h-[50vh] lg:max-h-none">
        {effects.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/30 p-6 text-center text-sm text-muted-foreground">
            No effects applied yet. Add an effect from the library to get started.
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {effects.map((effect, index) => {
              const controls = effect.renderControls((params) => {
                updateEffectParams(effect.id, params)
              })

              return (
                <Card key={effect.id} className="bg-card/70">
                  <CardHeader className="mb-3 flex flex-row items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {effect.name}
                      </CardTitle>
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
                          aria-label="Move effect up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => moveEffect(effect.id, 'down')}
                          disabled={index === effects.length - 1}
                          aria-label="Move effect down"
                        >
                          <ArrowDown className="h-4 w-4" />
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
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {effect.isEnabled ? (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{effect.isEnabled ? 'Active' : 'Disabled'}</span>
                    </div>
                    {controls}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
