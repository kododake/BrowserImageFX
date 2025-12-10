/*
 * BrowserImageFX
 * Copyright (C) 2025 kododake
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { EffectLibrary } from '@/components/layout/EffectLibrary'
import { EffectStackPanel } from '@/components/layout/EffectStackPanel'
import { CanvasWorkspace } from '@/components/editor/CanvasWorkspace'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function App() {
  const [isMobileEffectsOpen, setIsMobileEffectsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-6 pb-24 sm:px-6 lg:pb-10 lg:flex-row lg:px-8 lg:py-10">
        <aside className="order-2 w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:order-1 lg:w-72 lg:p-5 xl:w-80">
          <EffectLibrary />
        </aside>
        <main className="order-1 flex w-full flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-6 lg:order-2">
          <CanvasWorkspace />
        </main>
        <aside className="order-3 hidden w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:block lg:w-80 lg:p-5">
          <EffectStackPanel />
        </aside>
      </div>
      {!isMobileEffectsOpen && (
        <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 drop-shadow-2xl lg:hidden">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full px-4 py-2 shadow-lg shadow-black/40"
            onClick={() => setIsMobileEffectsOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
            Adjust effects
          </Button>
        </div>
      )}
      <MobileEffectsSheet
        isOpen={isMobileEffectsOpen}
        onClose={() => setIsMobileEffectsOpen(false)}
      />
    </div>
  )
}

export default App

type MobileEffectsSheetProps = {
  isOpen: boolean
  onClose: () => void
}

function MobileEffectsSheet({ isOpen, onClose }: MobileEffectsSheetProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-40 flex flex-col justify-end lg:hidden',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <button
        type="button"
        aria-hidden="true"
        className={cn(
          'absolute inset-0 w-full transition-opacity duration-200',
          isOpen ? 'cursor-pointer opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        style={{ backgroundColor: isOpen ? 'rgba(15, 23, 42, 0)' : 'transparent' }}
      />
      <div
        className={cn(
          'relative mx-auto w-full max-w-xl px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-[110%]',
        )}
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/30" aria-hidden="true" />
        <div className="rounded-t-3xl border border-white/10 bg-slate-950/90 shadow-[0_-20px_45px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <EffectStackPanel variant="mobile" onRequestClose={onClose} className="rounded-t-3xl p-2" />
        </div>
      </div>
    </div>
  )
}
