# 各框架的「插槽」寫法

插槽＝一個物件的共用介面，加上每個風格各一份實作，再加一個「依目前風格取出那一份」的函式。
產生器只認資料夾結構，所以不管哪個框架，檔案都放成：

```
<variantsDir>/
  base/        Avatar.tsx  Divider.tsx  EmptyState.tsx   ← 基本款：每個物件都要有
  ocean/       Avatar.tsx                                ← 只放這個風格有專屬設計的物件
  paper/       Avatar.tsx  Divider.tsx
```

目錄

1. React（TypeScript）
2. Vue 3
3. Svelte
4. 只有 CSS、沒有元件框架
5. 單一風格的專案

## 1. React（TypeScript）

```tsx
// src/ui/slots.ts
import type { FC } from "react";
import * as base from "./variants/base";
import * as ocean from "./variants/ocean";

export type AvatarProps = { size: "sm" | "md"; name: string };
export type DividerProps = { place?: "section" | "list" };
export type Slots = { Avatar: FC<AvatarProps>; Divider: FC<DividerProps> };

// 每個風格只寫自己有的；缺的由基本款補（展開順序：基本款在前，被專屬覆蓋）
const VARIANTS: Record<string, Slots> = {
  base: base as Slots,
  ocean: { ...(base as Slots), ...(ocean as Partial<Slots>) },
};

export function useVariant(): Slots {
  const id = useCurrentVariantId(); // 從 context、URL 或使用者設定取得
  return VARIANTS[id] ?? VARIANTS.base;
}
```

- 每個風格資料夾放一個 `index.ts`，`export { Avatar } from "./Avatar";`。
- 「這個風格刻意不畫」：`export const Ornament: FC = () => null;`，產生器用 `nullPattern` 認出來。
- 型別寫在共用介面，所有風格共用同一組 props，換風格時頁面不用改。

## 2. Vue 3

```ts
// src/ui/slots.ts
import { computed, type Component } from "vue";
const files = import.meta.glob("./variants/*/*.vue", { eager: true, import: "default" });

export function useVariant(name: string) {
  const id = useCurrentVariantId();
  return computed<Component>(() => (files[`./variants/${id.value}/${name}.vue`] ?? files[`./variants/base/${name}.vue`]) as Component);
}
```

```vue
<script setup lang="ts">
const Avatar = useVariant("Avatar");
</script>
<template><component :is="Avatar" size="md" :name="user.name" /></template>
```

- 頁面裡寫 `<Avatar …>` 或 `<avatar …>` 產生器都認得；只寫 `useVariant("Avatar")` 時，在設定檔的 `objects` 用途裡註明取用方式。
- 「不畫」：元件 template 留空，並在設定檔把 `nullPattern` 設成 `<template>\\s*</template>`。

## 3. Svelte

```ts
// src/ui/slots.ts
const files = import.meta.glob("./variants/*/*.svelte", { eager: true, import: "default" });
export const pick = (id: string, name: string) =>
  files[`./variants/${id}/${name}.svelte`] ?? files[`./variants/base/${name}.svelte`];
```

```svelte
<script>
  import { pick } from "$lib/ui/slots";
  import { variant } from "$lib/stores";
  $: Avatar = pick($variant, "Avatar");
</script>
<svelte:component this={Avatar} size="md" name={user.name} />
```

## 4. 只有 CSS、沒有元件框架

物件就是一組 class 或 HTML 片段，風格用 `data-theme` 切換：

```
src/ui/variants/base/Divider.css      .divider { … }
src/ui/variants/ocean/Divider.css     [data-theme="ocean"] .divider { … }
```

- 設定檔 `extensions` 改成 `[".css", ".html"]`，`sourceDirs` 指向放頁面的資料夾。
- 產生器找 `<Divider` 找不到 class 用法；這時在 `objects` 的用途寫清楚 class 名稱，「使用處」欄當參考就好。

## 5. 單一風格的專案

`variants` 只放一個（例如 `[{ "id": "base", "name": "預設" }]`）。總表會省略風格欄，只列物件、用途、程式、使用處。
這樣仍然有用：AI 知道已經有哪些元件，也看得到哪些做了沒人用。之後要加風格，只要多開一個資料夾、在 `variants` 加一行。
