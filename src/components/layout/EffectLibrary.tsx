import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { listAvailableEffects } from '@/core/effects/registry'
import { useEffectStore } from '@/store/effects'

export function EffectLibrary() {
  const addEffect = useEffectStore((state) => state.addEffect)
  const availableEffects = listAvailableEffects()

  return (
    <div className="flex h-full flex-col">
      <header className="mb-4 flex items-center gap-2 px-4">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Effect Library</p>
          <p className="text-xs text-muted-foreground">Stack multiple effects to craft your look.</p>
        </div>
      </header>
      <ScrollArea className="flex-1 px-4 max-h-[50vh] lg:max-h-none">
        <div className="space-y-3 pb-4">
          {availableEffects.map((effect) => (
            <Card key={effect.type} className="bg-card/60">
              <CardHeader className="mb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {effect.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground">
                <p>{effect.description}</p>
                <Button
                  size="sm"
                  onClick={() => {
                    const instance = effect.create()
                    addEffect(instance)
                  }}
                >
                  Add to stack
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
