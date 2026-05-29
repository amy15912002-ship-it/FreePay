# Design System — Platform Foundation

> 本文件由設計系統工作坊與產品、專案實作迭代整理，涵蓋平台色彩、文字、元件選用、版面容器與互動規則。

---

## 0. 適用範圍與強制遵循要求

### 適用對象

本設計系統適用**鉅亨買基金平台旗下所有產品**

### 強制遵循規則

> **本文件為平台級設計規範來源，所有新產品與功能開發必須以此為準。**

| 規則 | 說明 |
|---|---|
| 禁止自行定義色票 | 不得在元件樣式中直接寫入未收錄於本文件的 HEX 色碼 |
| 優先使用 Token | 引用顏色時，一律使用本文件定義的 Token，不直接寫 hardcoded HEX |
| 元件優先使用 Angular Material v14 | 介面元件優先套用 Angular Material v14；若 v14 無法滿足需求，再檢查本文件已定義的特規元件；若仍無可用元件，需先提出確認 |
| 按鈕層級遵循 §3 | 任何按鈕的角色與視覺樣式，須符合 §3 按鈕層級定義，不得自創新層級 |
| 字型遵循字體規範 | 所有中文介面文字一律使用 Noto Sans TC；字級與行高遵循 §4 Typography Scale |

### 新增或修改規範的流程

1. 若現有規範無法滿足設計或實作需求，**不得直接新增規則或自行補到文件中**，必須先提出待確認項目，經設計與前端雙方確認後才可實施
2. 此規則適用於所有範圍，包含顏色、字級、間距、元件、互動、RWD、資料呈現、文案格式與例外情境
3. 影響既有元件的修改，須列出受影響元件清單並通知開發團隊

---

## 1. 色彩系統

### 1.1 品牌色

| Token | Hex | 說明 | 用途 |
|---|---|---|---|
| `--color-brand-primary-50` | `#FFF0EC` | Primary 最淡 tint | 品牌淡底、選取淡底、錯誤 light ring、品牌提示框底色 |
| `--color-brand-primary-100` | `#FCCFBE` | Primary hover 淡底 | 品牌 hover 淡底、輕量提示背景 |
| `--color-brand-primary-200` | `#F9A98F` | Primary border tint | 品牌淡邊框、已完成 step 淡色狀態 |
| `--color-brand-primary-300` | `#F47355` | Primary hover 過渡色 | 輔助 hover、品牌狀態過渡；主要 hover 仍優先用 `--color-brand-primary-600` |
| `--color-brand-primary-400` | `#F04D29` | **Primary base — 主色** | 主要按鈕、主要行動、選取狀態、品牌重點數字、Input error border |
| `--color-brand-primary-600` | `#C23B1A` | Primary strong | 主要按鈕 hover、pressed 前一層、錯誤訊息、14px 品牌小字 |
| `--color-brand-primary-800` | `#8C240D` | Primary deepest | 主要按鈕 pressed、淡品牌底上的強文字 |
| `--color-brand-secondary-50` | `#FFF8EE` | Secondary 最淡 tint | Warning 提示底色 |
| `--color-brand-secondary-100` | `#FDDFA6` | Secondary highlight tint | Highlight 底色 |
| `--color-brand-secondary-200` | `#FCC974` | Secondary border tint | Warning / highlight 淡邊框 |
| `--color-brand-secondary-300` | `#FBB754` | Secondary icon / accent | 輔助 icon、局部 accent |
| `--color-brand-secondary-400` | `#FAA634` | **Secondary base — 次色** | 次要品牌輔助色；需注意白字對比不足，不作主要文字底色 |
| `--color-brand-secondary-600` | `#C87F1A` | Secondary strong | Warning 邊框、warning hover |
| `--color-brand-secondary-800` | `#7A4A08` | Secondary deepest | Warning 淡底上的文字 |
| `--color-brand-tertiary-50` | `#E8F8F9` | Tertiary 最淡 tint | Info 提示底色、focus light ring |
| `--color-brand-tertiary-100` | `#A8E4E8` | Tertiary border tint | Info 邊框、淡 icon 背景 |
| `--color-brand-tertiary-200` | `#70D4DA` | Tertiary decorative tint | 輕量裝飾線、輔助邊框 |
| `--color-brand-tertiary-300` | `#3EC2CF` | **Tertiary base — 第三色** | Input focus border、選中邊框、連結色（需搭配 underline） |
| `--color-brand-tertiary-400` | `#2A9BAA` | Tertiary hover / info strong | Info icon hover、可互動說明 icon hover、資訊強調 |
| `--color-brand-tertiary-600` | `#1E7480` | Tertiary strong | 小字連結、visited、inline link |
| `--color-brand-tertiary-800` | `#124D55` | Tertiary deepest | Info 淡底上的文字 |

### 1.2 中性灰階

| Token | Hex | 說明 | 用途 |
|---|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | 純白 | 頁面主背景、卡片底色、品牌色按鈕文字 |
| `--color-neutral-50` | `#F8F8F8` | 最淡灰底 | 次要背景、輸入框底色、已上傳檔案列表底色 |
| `--color-neutral-100` | `#F2F2F2` | 淺灰底 | Hover 底色、disabled 背景、表頭底色 |
| `--color-neutral-150` | `#E6E6E6` | 淺邊框 | 卡片邊框、分隔線、disabled border |
| `--color-neutral-200` | `#D9D9D9` | 強邊框 | 輸入框預設邊框、Ghost / Outline 按鈕預設邊框 |
| `--color-neutral-250` | `#CCCCCC` | Disabled 灰 | Disabled 文字、低可用狀態 |
| `--color-neutral-300` | `#B3B3B3` | Hover 邊框灰 | 輸入框 hover 邊框、Ghost / Outline hover 邊框 |
| `--color-neutral-400` | `#999999` | 第三級文字灰 | Placeholder、helper text、非重要輔助文字（14px 以上） |
| `--color-neutral-500` | `#808080` | 中灰 | 表格輔助資訊、弱標籤 |
| `--color-neutral-600` | `#666666` | 次文字 | 說明文字、meta、表單 label、Ghost button 文字 |
| `--color-neutral-700` | `#4D4D4D` | 深輔助文字 | 次要標題、強輔助資訊 |
| `--color-neutral-800` | `#333333` | 主要文字 | 主要內文、輸入文字、表格儲存格 |
| `--color-neutral-850` | `#262626` | 標題文字 | 區塊標題、卡片標題 |
| `--color-neutral-900` | `#1A1A1A` | 顯示文字 | 頁面主標題、大數字、重要標題 |
| `--color-neutral-950` | `#0D0D0D` | 極深文字 | 高對比標題，需謹慎使用 |
| `--color-neutral-1000` | `#000000` | 純黑 | 特殊高對比需求，謹慎使用 |

### 1.3 狀態與資料色

| Token | Hex | 說明 | 用途 |
|---|---|---|---|
| `--color-price-up` | `#CF1322` | 台灣市場漲色，來源：PlatformRules.md §2.5 | 用於報酬率、漲跌幅與金額型損益等正向績效資料 |
| `--color-price-down` | `#389E0D` | 台灣市場跌色，來源：PlatformRules.md §2.5 | 用於報酬率、漲跌幅與金額型損益等負向績效資料 |

> 若需新增資料色或修改漲跌色，不得自行補色；需先提出確認。

**設計筆記**

`#CF1322` 與 `#389E0D`，符合台灣市場「紅漲綠跌」慣例，且在白底上的辨識度更穩定。此組色彩主要用於報酬率、漲跌幅與金額型損益等績效數字，因此需優先考量表格、小字與長時間閱讀情境的清晰度。

### 1.4 陰影與遮罩

陰影分三層階層，依元素浮起層級選用；遮罩用於對話框背景。

| Token | 值 | 用途 |
|---|---|---|
| `--shadow-sm` | `0 2px 12px rgba(0, 0, 0, 0.08)` | 低層級：嵌入式卡片、確認區塊、輕浮起元素 |
| `--shadow-md` | `0 6px 24px rgba(0, 0, 0, 0.12)` | 中層級：浮起卡片、展開區、清單群組 |
| `--shadow-lg` | `0 8px 40px rgba(0, 0, 0, 0.18)` | 高層級：對話框、彈窗、modal panel |
| `--color-overlay-scrim` | `rgba(0, 0, 0, 0.45)` | 對話框背景遮罩 |

> 不得自行寫入 `rgba(0, 0, 0, X)` 處理陰影或遮罩。若現有三層階層無法滿足需求，需先提出確認，不得自行新增陰影層級。

---

## 2. 色彩使用規則

- 實作時一律使用本文件 Token，不直接寫 hardcoded HEX。
- 若色彩系統已定義用途，優先依用途使用。
- 若找不到合適的顏色或狀態，不得自行新增色票或規則，需先提出確認。
- 同一元件的 Default / Hover / Focus / Pressed / Disabled / Error / Selected 狀態需依本文件既有狀態表，不得局部自創。
- 只有績效變動資料使用漲跌顏色，包含報酬率、漲跌幅與金額型損益。已投入金額、已領取金額、市值、成本等非績效變動欄位不因正負值套用漲跌色。`-`、`—`、空值與 `0` 不套漲跌顏色。

### 2.1 Input 狀態

| Token | Hex | 用途 |
|---|---|---|
| `--color-input-bg` | `#FFFFFF` | 輸入框背景 |
| `--color-input-bg-disabled` | `#F2F2F2` | Disabled 背景 |
| `--color-input-border-default` | `#D9D9D9` | 預設邊框 |
| `--color-input-border-hover` | `#B3B3B3` | Hover 邊框 |
| `--color-input-border-focus` | `#3EC2CF` | Focus 邊框（Brand Tertiary） |
| `--color-input-border-error` | `#F04D29` | Error 邊框（Brand Primary） |
| `--color-input-border-disabled` | `#E6E6E6` | Disabled 邊框 |
| `--color-input-text` | `#333333` | 輸入文字 |
| `--color-input-placeholder` | `#999999` | Placeholder 文字 |
| `--color-input-text-disabled` | `#CCCCCC` | Disabled 文字 |
| `--color-input-label` | `#666666` | Label 文字 |
| `--color-input-label-error` | `#C23B1A` | Error 時 Label（小字需用 600）|
| `--color-input-label-disabled` | `#CCCCCC` | Disabled 時 Label |
| `--color-input-helper` | `#999999` | Helper text |
| `--color-input-helper-error` | `#C23B1A` | Error message（取代 helper text）|
| `--color-input-shadow-focus` | `0 0 0 3px #E8F8F9` | Focus light ring（Tertiary 50）|
| `--color-input-shadow-error` | `0 0 0 3px #FFF0EC` | Error light ring（Primary 50）|

**Placeholder 書寫規則**

- Placeholder 僅提供輸入格式提示（如「請輸入姓名」、「example@email.com」），**不得出現「（選填）」字樣**。
- 必填／選填狀態已由 Label 旁的 `*` 紅色標記區分，在 placeholder 重複標示會造成視覺混亂。
- 選填欄位若無明確格式提示，placeholder 可留空或省略。

**Angular Material v14 實作提醒**

- 實作前需先確認要對齊的官方範例變體，例如 Input examples 中的 `fill`、`outline` 或預設樣式；不得只套用 `matInput` 後自行猜測外觀。
- 若官方範例變體與設計系統狀態色不同，狀態色以本節 token 為準。
- 欄位前後綴（如幣別、百分比）只有在需求明確時才加入，不預設補上。

### 2.2 Upload 區域狀態（含已上傳檔案列表）

| Token | Hex | 用途 |
|---|---|---|
| `--color-input-upload-border` | `#D9D9D9` | 上傳區虛線邊框（同 input-border-default）|
| Hover 狀態 | — | **直接沿用 `--color-input-border-hover`**（`#B3B3B3`），與輸入框 hover 行為一致，不另立 token |
| `--color-input-upload-icon` | `#999999` | 上傳圖示色 |
| `--color-input-upload-text` | `#333333` | 上傳說明主文字 |
| `--color-input-upload-hint` | `#999999` | 格式提示文字（helper）|
| `--color-input-file-bg` | `#F8F8F8` | 已上傳檔案列表底色（bg-subtle）|
| `--color-input-file-icon` | `#F04D29` | 檔案類型圖示色 |
| `--color-input-file-name` | `#333333` | 檔案名稱文字 |
| `--color-input-file-remove` | `#666666` | 刪除按鈕預設色 |
| `--color-input-file-remove-hover` | `#C23B1A` | 刪除按鈕 hover（Primary 600，示意危險）|
| `--color-input-file-remove-hover-bg` | `#FFF0EC` | 刪除按鈕 hover 底色 |

### 2.3 Radio Button / Checkbox 狀態

| Token | Hex | 用途 |
|---|---|---|
| `--color-input-radio-border` | `#999999` | 未選取邊框 |
| `--color-input-radio-checked` | `#F04D29` | 選取狀態邊框與填充色 |
| `--color-input-radio-ripple` | `#FFF0EC` | Hover 圓形光暈背景 |
| `--color-input-checkbox-border` | `#999999` | 未選取邊框 |
| `--color-input-checkbox-checked` | `#F04D29` | 選取狀態背景與勾選色 |
| `--color-input-checkbox-ripple` | `#FFF0EC` | Hover 圓形光暈背景 |

> **互動行為規範：**
> - **Cursor**：整個可點擊區域（含元件本體、Label 文字）一律使用 `cursor: pointer`
> - **Hover ripple**：僅在元件本體周圍顯示圓形光暈（外擴 `10px`），不擴及整段文字列
> - **Hover 不改變邊框色**：Hover 時僅出現 ripple 光暈
> - **選取狀態**：Radio 內部填入實心圓點；Checkbox 背景填滿並顯示白色勾選符號
> - **狀態優先**：若 Angular Material v14 預設樣式與本節狀態規則不一致，需以本節規則覆寫；若覆寫會影響既有元件，需先提出確認。

---

## 3. 按鈕層級

### 3.1 兩套按鈕系統

| | A — 表單按鈕 | B — CTA 按鈕 |
|---|---|---|
| `border-radius` | `8px` | `32px` |
| 用途 | 功能性操作、表單送出、流程控制、資料操作 | 行銷性 CTA，網站主要按鈕 |
| 情境 | 表單、對話框、設定頁 | Landing page、Hero 區塊、頁面 CTA |

### 3.2 A — 表單按鈕（border-radius: 8px）

> 用於產品流程與系統功能中的操作按鈕，例如送出、確認、取消、返回、查詢、儲存、刪除與對話框操作。

#### 尺寸

| 尺寸 | Height | Padding | Font size | Min-width |
|---|---|---|---|---|
| SM | `36px` | `6px 20px` | `14px / 500` | `88px` |
| MD | `44px` | `10px 24px` | `14px / 500` | `88px` |

#### 變體 × 狀態

| 變體 | Default bg | Default text | Default border | Hover bg | Hover border | Pressed bg | Disabled |
|---|---|---|---|---|---|---|---|
| Primary | `#F04D29` | `#FFFFFF` | none | `#C23B1A` | — | `#8C240D` | bg `#E6E6E6` / text `#CCCCCC` |
| Ghost 中性 | transparent | `#666666` | `1.5px #D9D9D9` | `#F2F2F2` | `#B3B3B3` | `#E6E6E6` | text `#CCCCCC` / border `#E6E6E6` |

---

### 3.3 B — CTA 按鈕（border-radius: 32px）

#### 尺寸

| 尺寸 | Height | Padding | Font size | Min-width | 建議情境 |
|---|---|---|---|---|---|
| MD | `48px` | `12px 36px` | `16px / 500` | `140px` | 一般頁面 CTA 區塊 |
| LG | `56px` | `14px 48px` | `16px / 500` | `160px` | Hero、首屏主視覺 |

#### 變體 × 狀態

| 變體 | 使用情境 | Default bg | Default text | Border | Hover |
|---|---|---|---|---|---|
| Filled（主要）| 所有 CTA 主要動作 | `#F04D29` | `#FFFFFF` | none | bg `#C23B1A` |
| Outline 品牌色 | 淺色背景的次要 CTA | transparent | `#F04D29` | `2px #F04D29` | bg `#FFF0EC` |
| Outline 白色 | 深色 / 品牌色背景的次要 CTA | transparent | `#FFFFFF` | `2px #FFFFFF` | bg `rgba(255,255,255,0.1)` |
| Disabled | — | `#E6E6E6` | `#CCCCCC` | none | cursor: not-allowed |

---

### 3.4 變體使用情境對照

| 變體 | 功能性場景（表單）| 行銷 CTA 場景 |
|---|---|---|
| Filled 品牌色 | 主要送出、確認 | 主要 CTA |
| Ghost 中性（無邊框）| 取消、返回 | 不使用 |
| Outline 中性（灰框）| 並列次要動作 | 不使用 |
| Outline 品牌色 | 不使用 | 淺色背景次要 CTA |
| Outline 白色 | 不使用 | 深色背景次要 CTA |

**表單送出按鈕的形狀判斷規則**

| 表單所在情境 | 建議按鈕系統 | border-radius | 對齊方式 |
|---|---|---|---|
| 嵌入行銷頁 / 洽談合作 / 聯絡我們 | B — CTA 按鈕 | `32px` | 置中 |
| 後台設定 / 對話框 / 系統功能表單 | A — 表單按鈕 | `8px` | 右對齊 |

### 3.5 按鈕組排列規則

- 桌機 / 平板：水平排列，**置中對齊**
- 手機：水平並列，各佔 50%，**主按鈕在右**
- DOM 順序：次要按鈕在前（左），主要按鈕在後（右）——不使用 `order` 屬性，確保 Tab 焦點順序正確

---

### 3.6 Segmented Control（Toggle 選取按鈕）

> 用途：在同一表單區塊內切換互斥的模式選項（如「依金額 / 依比例」、「境內 / 境外」）。
> **不屬於操作動作，屬於表單控制項**，視覺重量應明顯輕於主要動作按鈕。

#### 規格

| 狀態 | Background | Text color | Border |
|---|---|---|---|
| Default | `--color-neutral-0`（白） | `--color-neutral-600`（`#666666`） | `1px --color-neutral-200`（`#D9D9D9`） |
| **Hover** | `--color-neutral-0`（白） | `--color-neutral-800`（`#333333`） | `1px --color-neutral-300`（`#B3B3B3`） |
| Active | `--color-brand-primary-50`（`#FFF0EC`） | `--color-brand-primary-400`（`#F04D29`） | `1px --color-brand-primary-400`（`#F04D29`） |
| Disabled | `--color-neutral-100` | `--color-neutral-400` | `1px --color-neutral-150` |

- 尺寸：高度 SM（`36px`），font-size `14px`，border-radius `8px`
- **禁止**使用 Filled（橘紅底色 + 白字）作為 active 狀態，該樣式保留給主要操作按鈕（Primary）
- **Hover 不得使用品牌色**：懸停只收緊邊框至 `--color-neutral-300`（#B3B3B3），品牌橘紅（`#F04D29`）保留給 Active（已選中）。此規則適用於所有「選取類」互動元素，例如分段切換、卡片型單選、幣別選擇、門檻選擇與篩選 pill。主要行動按鈕與導覽 tab 不受此限制。
- 通常以 `flex: 1` 並列，寬度平均分配

#### 與主按鈕的區分原則

| | Segmented Control active | Primary 主按鈕 |
|---|---|---|
| Background | 淺橘（`#FFF0EC`） | 橘紅（`#F04D29`） |
| Text | 橘紅 | 白色 |
| 語義 | 選取狀態 | 執行動作 |

---

### 3.7 圓形按鈕（通用）

> 平台通用的圓形操作按鈕，用於清單或卡片內的精簡內聯操作（如比較、收藏、加入購物車、申購、更多選單）。與矩形按鈕分工：圓形按鈕用於清單列／卡片內的內聯操作；§3.2／§3.3 矩形按鈕用於表單送出與頁面 CTA。

#### 規格

| 項目 | 值 |
|---|---|
| 尺寸 | `32 × 32px`（正圓） |
| `border-radius` | `50%` |
| 內部 icon | Bootstrap Icons，`16px`（§5） |
| 文字型字級 | `14px / 700` |
| 多顆並排間距 | `8px` |

#### 變體 × 狀態

| 變體 | Default | Hover |
|---|---|---|
| 描邊型（中性） | 底 `--color-neutral-0`、邊框 `1px --color-neutral-200`、icon `--color-text-secondary` | 邊框收緊至 `--color-neutral-300`、icon `--color-text-primary`；hover 不上品牌色（同 §3.6 規則） |
| 實心型 | 底與邊框 `--color-brand-primary-400`、文字 `--color-text-on-brand` | 底與邊框 `--color-brand-primary-600` |

**規則**

- icon-only 圓鈕（如「⋯」更多）必須提供 `aria-label`。
- 文字型圓鈕「BUY」採英文，為品牌慣例之明確例外（平台 UI 文字原則為中文，詳 §4.5）。

**尚待補齊**

- `Pressed`／`Disabled` 狀態尚未定義。
- 目前描邊型僅「中性」一種；若有品牌色描邊變體需另行補入。

---

## 4. 文字排版規範（Typography）

### 4.1 字體家族

| Token | 值 | 用途 |
|---|---|---|
| `--font-primary` | `'Noto Sans TC', 'Roboto', sans-serif` | **全站唯一字型**：中英文介面文字、數字、金額皆使用 |

> `body` 預設：`font-family: var(--font-primary); font-size: 16px`。文字顏色依 §1 色彩系統定義，不在 Typography 章節重複規範；行高依本章行高規則套用。

---

### 4.2 字級階層（Type Scale）

| 層級 | px | font-weight | 用途 |
|---|---:|---:|---|
| Display | `48px` | `700` | 首屏主視覺大標，少量使用 |
| H1 | `36px` | `700` | 頁面主標題 |
| H2 | `28px` | `700` | 主要區塊標題 |
| H3 | `20px` | `700` | 小節標題 |
| H4 | `18px` | `500` | 卡片標題、側欄標題、區塊內標題、`.block-title` |
| Body LG | `18px` | `400` | 長篇閱讀段落、較大內文 |
| Body | `16px` | `400` | 主要內文、表格儲存格、輸入值 |
| Body SM | `14px` | `400–500` | 表單 label、helper text、輔助說明、訂單表內文、**表格表頭** |
| Body Emphasis | `16px` | `500–700` | 金額、市值、契約 ID、確認頁摘要值、按鈕文字、Tab、Chip |
| Body SM | `14px` | `400–500` | 表單 label、helper text、輔助說明、訂單表內文 |
| Body SM Emphasis | `14px` | `500–600` | status badge、tag、chip、加粗 label |
| Mini | `12px` | `400 / 500` | 手機極次要 meta、badge、tag、step number |

**強制規則**

1. **所有字級必須為偶數**：僅使用 `12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 36 / 48px`，禁止 `13 / 15 / 17px` 等奇數字級。
2. **font-family 唯一**：全站僅用 `var(--font-primary)`（Noto Sans TC）。**禁止使用 mono 字型**；數字欄位以 `font-variant-numeric: tabular-nums` 達成等寬效果。
3. **12px 僅限手機極次要資訊**：桌機不得使用 12px；任何使用者需要判斷或操作的主資訊都不能是 12px。
4. **加粗策略**：Body 文字加粗用 500（中等強調）或 600–700（強強調）；Body SM 最高使用 600。
5. **letter-spacing 預設為 0**：除特殊品牌字樣或另行確認的裝飾標籤外，UI 文字、表單、按鈕、數字皆不加字距。

**weight 細則**

| 字級 | 預設 weight | 可加粗到 | 用途 |
|---|---|---|---|
| H1–H4 | 700 / 500 | — | 標題用預設值，不再加粗 |
| Body | 400 | 500（label）、600（值）、700（重點數字） | 依資訊重要度 |
| Body SM | 400 | 500（form label、加粗 label）、600（強調） | 不到 700 |
| Mini | 400 | 500 | 極次要資訊，不再加粗 |

**行高規則**

中文介面不以每個字級固定一組 line-height，而是依文字所在情境設定。

| 類型 | line-height | 說明 |
|---|---:|---|
| 標題 | `1.25–1.4` | H1 / H2 較緊，H3 / H4 可稍鬆，避免標題過度鬆散 |
| 一般 UI 文字 | `normal` 或由元件高度控制 | 按鈕、tab、chip、input、table cell 優先依元件高度垂直置中 |
| 輔助說明 | `1.5–1.7` | helper text、hint panel、短說明 |
| 段落文字 | `1.7–1.8` | 長文、說明段落、閱讀型內容 |
| 數字 / 金額 / 百分比 | `normal` 或由元件高度控制 | 搭配 `tabular-nums`，避免數字列高度不一致 |

---

### 4.3 RWD 與最低字級

平台主要斷點如下。若專案需要新增斷點或特殊縮放規則，需先提出確認。

| 類型 | 條件 | 最小字級 | 說明 |
|---|---|---:|---|
| Mobile | `max-width: 767px` | `12px` | 手機版；12px 只限極次要 meta、badge、tag、step number |
| Desktop | `min-width: 768px` | `14px` | 桌機與平板以上；不得使用 12px |

大標於手機縮減字號；Body 以下維持不變。

| 層級 | Desktop（≥ 768px） | Mobile（≤ 767px） |
|---|---|---|
| Display | `48px` | `32px` |
| H1 | `36px` | `28px` |
| H2 | `28px` | `22px` |
| H3 | `20px` | `18px` |
| H4 | `18px` | `16px` |
| Body LG | `18px` | `16px` |
| Body | `16px` | `16px` |
| Body SM | `14px` | `14px` |
| Mini | 不使用 | `12px` |

主要內容、表單欄位、按鈕、金額、報酬率、日期與契約編號不得低於 `14px`。

---

### 4.4 閱讀文字與段落

本節只規範閱讀型文字，不套用於按鈕、表單欄位、表格儲存格、卡片統計值等 UI 元件。

| 規則 | 建議 |
|---|---|
| 長篇段落行寬 | 約 `32–36` 個中文字；過寬時應限制內容寬度 |
| 一般說明段落 | 使用 Body 或 Body SM，行高 `1.7–1.8` |
| 段落之間 | 以一個段落行距形成分隔，不用額外裝飾線 |
| 標題與段落 | 標題下方需保留明確間距，避免標題貼近內文 |
| UI 元件 | 不套用閱讀段落行寬與段落間距規則 |


---

### 4.5 數字資料格式

本節規範數字、金額、百分比與日期的顯示格式。顏色使用回到 §1 色彩系統與 §2 色彩使用規則，不在本節重複定義。

#### 通用規則

| 類型 | 顯示規則 | 範例 |
|---|---|---|
| 千分位 | 數字需加逗號 | `1,000,000` |
| 數字欄位 | 使用等寬數字，不切換 mono 字型 | `tabular-nums` |
| 表格數字欄 | 原則上右對齊 | 金額、單位數、百分比 |
| 數字資料 | 不截斷 | 金額、報酬率、日期、契約編號 |
| UI 文字中的數量 | 所有介面文字（按鈕、標籤、說明文字、提示訊息等）中出現的數量，一律使用阿拉伯數字，不使用中文數字 | `近3個月`、`共5筆`、`最多10檔`（✗ 近三個月、共五筆）|
| 無資料 placeholder | 表格、清單、明細欄位的「無資料 / N/A」一律使用 hyphen-minus `-`（U+002D），禁混用 em dash `—` 或 en dash `–` | `-`（✗ `—`、`–`、空字串）|

#### 金額（台幣 / 外幣）

| 類型 | 顯示規則 | 範例 |
|---|---|---|
| 新台幣 | 使用中文「台幣」 | `台幣 10,000` |
| 外幣 | 使用中文幣別名 | `美元 500.50`、`日幣 5,000` |
| 小數位數 | 台幣取整數位；外幣最多 2 位小數，自動 trim 尾端零，不固定補 0 | `台幣 10,000`、`美元 500`、`美元 500.5`、`美元 500.25` |
| 正值 | 不顯示 `+` 號 | `台幣 500`、`500` |
| 負值 | 使用 `-` 號，不使用括號 | `-台幣 500` |

#### 百分比（報酬率、費率）

| 類型 | 顯示規則 | 範例 |
|---|---|---|
| 小數位數 | 統一 2 位小數 | `3.52%`、`-1.20%` |
| 正值 | 不顯示 `+` 號 | `3.52%` |
| 負值 | 使用 `-` 號，不使用括號 | `-1.20%` |

#### 單位數（基金持有單位、申購單位、贖回單位）

| 類型 | 顯示規則 | 範例 |
|---|---|---|
| 小數位數 | 最多 4 位小數，自動 trim 尾端零，不固定補 0 | `8,000`、`30.5`、`95.2381`、`109.0909` |
| 千分位 | 同通用規則加逗號 | `19,047.619` |
| 對齊 | 表格中右對齊；使用等寬數字（`tabular-nums`）避免逐列跳動 | — |

> 不得使用 `.toFixed(4)` 固定 4 位輸出造成 `8,000.0000` 視覺垃圾；改採 `toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: 4 })` 等等價邏輯。

#### 淨值（NAV）

| 類型 | 顯示規則 | 範例 |
|---|---|---|
| 小數位數 | 最多 4 位小數，自動 trim 尾端零，不固定補 0 | `10.5`、`16.2045`、`100`、`98.15` |
| 顯示格式 | 不前綴幣別代碼（淨值伴隨計價幣別欄位呈現，無需重複） | — |
| 千分位 | 同通用規則加逗號 | `16,850` |

> 同 §單位數規則：不得 `.toFixed(4)` 固定輸出。

**禁止事項**

- 不使用 `$` 或 `NT$`、`USD` 等代碼表示幣別；統一使用中文幣別名。
- 不使用括號表示負值。
- 不截斷金額、報酬率、日期與契約編號。
- 不使用 mono 字型處理數字對齊；數字欄位使用等寬數字即可。

#### 日期與時間

| 情境 | 格式 | 範例 |
|---|---|---|
| 一般日期 | `YYYY/MM/DD` | `2026/03/21` |
| 含時間 | `YYYY/MM/DD HH:mm` | `2026/03/21 14:30` |
| 相對時間（近期）| 中文相對描述 | `3 天前`、`剛剛` |
| 申購截止時間 | 明確標示日期＋時間＋時區 | `2026/03/21 14:00（台灣時間）` |

> 禁止使用 `03/21/2026`（美式格式）或 `21-03-2026`（歐式格式），以避免日月混淆。

#### 對齊與不可截斷

- 表格或列表中的金額、單位數、百分比與日期，需使用等寬數字顯示，避免欄位因數字寬度不同而跳動。
- 金額、報酬率、日期、契約編號不可截斷；容器不足時需換行、調整欄寬或改用響應式版型。
- 數字欄位在表格中原則上右對齊；若同一欄混合文字與數字，需依該欄主要資訊型態決定，並保持同頁一致。


---

## 5. 圖標規範（Icon）

### 5.1 圖標來源

所有產品頁面的圖標一律使用 **Bootstrap Icons**。設計稿可引用 [Figma Community Bootstrap Icons](https://www.figma.com/design/E4Hy6FPJGIgixZGuSd5psU/Bootstrap-Icons--Community-?node-id=0-1&t=6cKtW0ma1ePplkKs-1)，實作時需保留 Bootstrap Icons 原始 icon name。

- Icon 名稱需保留 Bootstrap Icons 原始命名，例如 `bi-info-circle`、`bi-arrow-left`。
- 禁止混用 Material Icons、Font Awesome 或臨時自繪 SVG。
- 若 Bootstrap Icons 沒有符合需求的圖示，需先提出確認，不得自行新增圖示風格。

### 5.2 使用原則

- 圖示需輔助操作或資訊辨識，不作無意義裝飾。
- 同一頁同一語意需使用同一 icon。
- 文字按鈕若有對應常見操作 icon，可搭配 icon 使用。

### 5.3 尺寸規範

| 使用情境 | 建議尺寸 |
|---|---|
| 行內文字旁（inline） | 16×16px |
| 按鈕內圖示 | 20×20px |
| 標題 / 功能入口 | 24×24px |
| 大型裝飾圖示 | 32×32px 以上 |

### 5.4 顏色規範

- 圖示顏色繼承所在元件的 CSS token，不得使用 hardcoded HEX
- 漲跌圖示（如上漲箭頭、下跌箭頭）必須遵循 PlatformRules.md 第 2.5 節色彩規定

---

## 6. 版面與特殊元件規範

### 6.1 頁型容器寬度

平台預設使用標準頁面容器。若頁面內容以單欄表單、逐步設定或確認送出為主，且標準容器會造成欄位過寬或閱讀動線鬆散，可使用窄版表單容器。容器選擇以內容型態為準，不以是否交易流程作為唯一判斷。

| 容器類型 | Container | 適用情境 |
|---|---|---|
| 標準頁面容器 | `1200px` | 平台大多數頁面、列表、總覽、搜尋、資料瀏覽、需橫向比較的內容 |
| 窄版表單容器 | `800px` | 單欄表單、逐步設定、確認送出、欄位不宜過寬的流程 |
| Modal / Dialog | 依內容層級設定，最大寬可到 `1200px` | 明細、確認、複雜表格 |

**響應式規則**

- 桌機容器置中，不額外加左右內縮。
- 手機以 `430px` viewport 為討論基準，左右各保留 `15px` safe margin，內容寬度約 `400px`。
- 手機版不應移除左右 safe margin。
- 斷點建議以 `767px` 作為 mobile / desktop 切換點；更小斷點僅作局部微調。

**區塊貼合規則**

- 區塊應貼齊所屬容器寬度。
- 同一流程或同一頁型內應使用一致容器寬度，避免切換時產生忽寬忽窄的感覺。
- 不在區塊外再包裝裝飾性卡片。
- 不使用 inline margin 撐版；區塊間距應由父層 layout 的 `gap` 控制。
- 區塊 padding、gap、border-radius 若尚未定義，需先提出確認。
- 若需要 `800px` / `1200px` 以外的容器寬度，需先提出確認。

### 6.2 Inline Hint Panel

短提示可使用 Angular Material v14 tooltip；但若說明內容超過一句、包含規則、換行或需要使用者閱讀，應使用下推式 inline hint panel。

此元件屬於平台特規元件，未來其他產品若需要相同型態的長說明，需引用此結構與樣式，避免各產品自行建立不同版本。

**使用規則**

- 觸發點只限 `i` icon 本身，不包含 label 旁空白區。
- 點擊 icon 展開 / 收合下方說明區塊。
- 展開後會下推內容，不浮在畫面上方。
- 內容可包含粗體、換行與多段文字。
- Icon 使用 Bootstrap Icons：`bi bi-info-circle`。

```html
<label class="form-label">
  說明標題
  <button class="hint-icon" type="button" aria-expanded="false" aria-controls="hint-id">
    <i class="bi bi-info-circle"></i>
  </button>
</label>
<div class="hint-panel" id="hint-id">
  說明內容
</div>
```

```css
.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-neutral-400);
  font-size: 14px;
  cursor: pointer;
}

.hint-icon:hover,
.hint-icon:focus-visible {
  color: var(--color-brand-tertiary-400);
}

.hint-panel {
  max-height: 0;
  overflow: hidden;
  margin-top: 0;
  margin-bottom: 0;
  padding: 0 12px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-150);
  border-radius: 6px;
  color: var(--color-neutral-600);
  font-size: 12px;
  line-height: 1.75;
  opacity: 0;
  transform: translateY(-4px);
  transition: max-height .22s ease, margin .22s ease, padding .22s ease, opacity .16s ease, transform .22s ease;
}

.hint-panel.is-open {
  max-height: 240px;
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 10px 12px;
  opacity: 1;
  transform: translateY(0);
}
```

### 6.3 固定日日期格狀選擇器

若 Angular Material v14 沒有 1-31 格狀日期 selector，而產品需要「每月日期」這類固定日選擇，可建立特規 date grid 元件，不必硬改成不符合需求的下拉選單或日期選擇器。

此元件適用於交易流程中「每月固定日」選擇情境。未來其他產品若出現相同需求，需引用此元件並維持一致視覺與互動，不得另行建立不同樣式。

**互動規則**

- 顯示 `1` 到 `31` 的固定按鈕。
- 選取狀態使用 `.on`。
- `29`、`30`、`31` 使用 `.long-month` dashed border。
- 點選 `29`、`30`、`31` 時，下方顯示長月提示文字。
- 每個按鈕需為 `button type="button"`，並能以鍵盤 focus / click 操作。

```html
<div class="date-grid">
  <button class="date-btn on" type="button">15</button>
  <button class="date-btn long-month" type="button">29</button>
</div>
<div class="helper date-long-hint">
  <span>若當月無 29 日，自動遞延至下個營業日執行。</span>
</div>
```

```css
.date-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.date-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-neutral-200);
  border-radius: 8px;
  background: var(--color-neutral-0);
  color: var(--color-neutral-600);
  font-family: var(--font-primary);
  font-size: 14px;
  cursor: pointer;
}

.date-btn:hover {
  background: var(--color-neutral-100);
}

.date-btn.on {
  border-color: var(--color-brand-primary-400);
  background: var(--color-brand-primary-400);
  color: var(--color-neutral-0);
  font-weight: 700;
}

.date-btn.long-month {
  border-style: dashed;
  color: var(--color-neutral-400);
}

.date-btn.long-month.on {
  border-style: solid;
  color: var(--color-neutral-0);
}
```
