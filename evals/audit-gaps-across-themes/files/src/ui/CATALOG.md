# 元件總表

> 這份檔案由 component-catalog 的 catalog.mjs 自動產生，請勿手改。說明文字改設定檔，程式改了重新產生；過期時檢查會失敗。

做畫面前先查這張表：要用的物件已經有了就直接用，不要在頁面裡另畫一份。找不到合適的，先問負責人，不要自己新增。

## 一覽

「專屬」＝這個風格有自己的版本；「用基本款」＝沒有專屬，自動用基本款；「不畫」＝這個風格刻意不畫。

| 物件 | 基本款 | 森林 | 復古 | 使用處 |
|---|---|---|---|---|
| [頭像](#avatar) `Avatar` | 專屬 | 專屬 | 專屬 | 1 處 |
| [分隔線](#divider) `Divider` | 專屬 | 專屬 | 用基本款 | 1 處 |
| [空狀態](#emptystate) `EmptyState` | 專屬 | 專屬 | 用基本款 | 1 處 |
| [點綴](#sparkle) `Sparkle` | 不畫 | 專屬 | 不畫 | **還沒有地方使用** |

## 各物件

<a id="avatar"></a>
### 頭像 `Avatar`

用途：頁首與留言的使用者頭像。

| 風格 | 程式 |
|---|---|
| 基本款 | [src/ui/variants/base/Avatar.tsx](variants/base/Avatar.tsx) |
| 森林 | [src/ui/variants/forest/Avatar.tsx](variants/forest/Avatar.tsx) |
| 復古 | [src/ui/variants/retro/Avatar.tsx](variants/retro/Avatar.tsx) |

使用處：[src/pages/Shop.tsx](../pages/Shop.tsx)

<a id="divider"></a>
### 分隔線 `Divider`

用途：區塊之間的分隔。

| 風格 | 程式 |
|---|---|
| 基本款 | [src/ui/variants/base/Divider.tsx](variants/base/Divider.tsx) |
| 森林 | [src/ui/variants/forest/Divider.tsx](variants/forest/Divider.tsx) |
| 復古 | [src/ui/variants/base/Divider.tsx](variants/base/Divider.tsx)（沒有專屬，用基本款） |

使用處：[src/pages/Shop.tsx](../pages/Shop.tsx)

<a id="emptystate"></a>
### 空狀態 `EmptyState`

用途：清單整個沒有內容時。

| 風格 | 程式 |
|---|---|
| 基本款 | [src/ui/variants/base/EmptyState.tsx](variants/base/EmptyState.tsx) |
| 森林 | [src/ui/variants/forest/EmptyState.tsx](variants/forest/EmptyState.tsx) |
| 復古 | [src/ui/variants/base/EmptyState.tsx](variants/base/EmptyState.tsx)（沒有專屬，用基本款） |

使用處：[src/pages/Shop.tsx](../pages/Shop.tsx)

<a id="sparkle"></a>
### 點綴 `Sparkle`

用途：小裝飾。

| 風格 | 程式 |
|---|---|
| 基本款 | [src/ui/variants/base/Sparkle.tsx](variants/base/Sparkle.tsx)（不畫） |
| 森林 | [src/ui/variants/forest/Sparkle.tsx](variants/forest/Sparkle.tsx) |
| 復古 | [src/ui/variants/base/Sparkle.tsx](variants/base/Sparkle.tsx)（不畫） |

使用處：**還沒有地方使用**
