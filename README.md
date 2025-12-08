# BrowserImageFX

> BrowserImageFX
> Copyright (C) 2025 kododake
>
> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU Affero General Public License as
> published by the Free Software Foundation, either version 3 of the
> License, or (at your option) any later version.
>
> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
> GNU Affero General Public License for more details.
>
> You should have received a copy of the GNU Affero General Public License
> along with this program. If not, see <https://www.gnu.org/licenses/>.
BrowserImageFX is a modern, client-side image processing studio for the web. Load an image, stack multiple visual effects, and export the result without ever leaving the browser or uploading files to a server.

## Highlights

- 🔁 **Composable effect pipeline** – apply, reorder, toggle, and remove stacked effects with instant feedback.
- 🎚️ **Rich parameter controls** – fine-tune effect parameters through accessible shadcn/ui components backed by Zustand state.
- 🖼️ **Canvas-driven preview** – rendering stays on the client via an extensible `EffectPipeline` that targets the HTML Canvas 2D context.
- 🌈 **HDR pipeline** – WebGL2 ベースのトーンマッピングで `.hdr` (RGBE) 画像を SDR に変換してから既存のエフェクトスタックに流し込めます。
- ⚡ **Vite + React + TypeScript** – fast developer workflow, strict typing, and predictable build output.
- 🎨 **Tailwind-powered glassmorphism UI** – dark, creative-focused layout with responsive zoom controls and keyboard-friendly interactions.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for bundling and dev server
- [Tailwind CSS](https://tailwindcss.com/) with lightweight shadcn-style UI primitives
- [Zustand](https://github.com/pmndrs/zustand) for effect stack state management
- Radix UI primitives (`@radix-ui/react-*`) + [lucide-react](https://lucide.dev/) icons

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173/`. A VS Code task named `npm: dev` is bundled for quick launch.

### Production Build

```bash
npm run build
npm run preview   # optional: preview the production bundle
```

## Key Concepts

- **Effect contracts** (`src/core/effects/types.ts`) define a consistent interface for all effects (`apply`, `renderControls`, and parameter management).
- **Pipeline orchestration** (`src/core/Pipeline.ts`) copies the original image into an off-screen canvas and executes the active effect stack sequentially before presenting the result.
- **Gaussian Blur example** (`src/core/effects/GaussianBlur.tsx`) demonstrates how to implement blur via canvas filters, complete with live slider controls.
- **State management** (`src/store/effects.ts`) keeps the effect stack ordered, toggleable, and reactive to parameter changes.
- **UI layout** organizes the experience into a three-column glassmorphism workspace:
  - Left: effect library (`EffectLibrary`)
  - Center: image workspace (`CanvasWorkspace`)
  - Right: active stack and controls (`EffectStackPanel`)

### HDR Workflow

- `.hdr` (Radiance RGBE) ファイルを読み込むと `src/core/hdr/RgbeLoader.ts` がデコードし、16bit 相当の線形浮動小数点データを生成します。
- `ToneMappingRenderer` (WebGL2) が露出とガンマを適用したトーンマッピングを行い、SDR `HTMLCanvasElement` を出力します。
- トーンマッピング後のキャンバスが既存の `EffectPipeline` に渡されるため、HDR 素材でもエフェクトスタックを通常通り利用できます。
- HDR 調整は `CanvasWorkspace` 内の「HDR Tone Mapping」セクションでリアルタイムに更新できます。WebGL2 非対応環境では警告を表示し、HDR 読み込みをスキップします。

## Directory Overview

```text
src/
  components/
    editor/          Canvas workspace and zoom controls
    layout/          Sidebars for effect library and stack
    ui/              Reusable shadcn-style primitives (button, slider, etc.)
  core/
    Pipeline.ts      Effect execution pipeline using Canvas 2D
    effects/         Effect interface, base class, and Gaussian blur implementation
  store/
    effects.ts       Zustand store for managing the effect stack
  lib/
    utils.ts         Utility helpers (class merging, effect IDs)
```

## Extending BrowserImageFX

- Add new effects by implementing the `IEffect` contract and registering the effect in `src/core/effects/registry.ts`.
- Create richer controls directly inside the effect’s `renderControls` method using shared UI primitives.
- Expand the pipeline with WebGL or worker-backed renderers by enhancing `EffectPipeline` while keeping the effect API stable.

### Adding a New Effect

1. **Create an effect class** under `src/core/effects/` that extends `BaseEffect` and implements the required methods. Start by defining default parameters in the constructor and implement the `apply` logic using the provided canvas context.
2. **Render controls** by returning React UI from `renderControls(onParamsChange)`. Reuse components in `src/components/ui/` (e.g., `Slider`, `Switch`) and call `onParamsChange` inside event handlers so the Zustand store receives updates.
3. **Register the effect** in `src/core/effects/registry.ts` by adding a new entry to the `definitions` array. Each entry exposes a `create` factory returning a fresh instance of your effect.
4. **Test the pipeline** by adding the effect through the left sidebar. Ensure toggling, reordering, and parameter changes behave as expected. If the effect depends on other settings, remember to clamp parameter values and guard expensive operations.

## Roadmap Ideas

- Additional effects: Brightness, Contrast, LUT support, pixelation, vignettes.
- Undo/redo history, effect presets, and saved stacks.
- Advanced canvas interactions like pan with click-drag and keyboard shortcuts for zoom.

---

Happy editing! Contributions and enhancements are welcome as the BrowserImageFX toolkit grows.
