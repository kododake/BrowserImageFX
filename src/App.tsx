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

import { EffectLibrary } from '@/components/layout/EffectLibrary'
import { EffectStackPanel } from '@/components/layout/EffectStackPanel'
import { CanvasWorkspace } from '@/components/editor/CanvasWorkspace'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-10">
        <aside className="order-2 w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:order-1 lg:w-72 lg:p-5 xl:w-80">
          <EffectLibrary />
        </aside>
        <main className="order-1 flex w-full flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-6 lg:order-2">
          <CanvasWorkspace />
        </main>
        <aside className="order-3 w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:w-80 lg:p-5">
          <EffectStackPanel />
        </aside>
      </div>
    </div>
  )
}

export default App
