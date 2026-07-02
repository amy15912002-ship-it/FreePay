# Design System — Platform Foundation

> 本文件由設計系統工作坊與產品、專案實作迭代整理，涵蓋平台色彩、文字、元件選用、版面容器與互動規則。

---

## 文件索引

- [0. 適用範圍與強制遵循要求](#0-適用範圍與強制遵循要求)
- [1. 色彩系統](#1-色彩系統)
- [2. 文字排版規範（Typography）](#2-文字排版規範typography)
- [3. 元件](#3-元件)
- [4. 圖標規範（Icon）](#4-圖標規範icon)
- [5. 版面與間距](#5-版面與間距)
- [6. 資料表格（Table）](#6-資料表格table)

### 0. 適用範圍與強制遵循要求

- [0.1 適用對象與文件定位](#01-適用對象與文件定位)
- [0.2 設計系統化原則](#02-設計系統化原則)
- [0.3 元件選型與 Angular Material 使用原則](#03-元件選型與-angular-material-使用原則)
- [0.4 強制遵循規則](#04-強制遵循規則)
- [0.5 新增或修改規範的流程](#05-新增或修改規範的流程)

---

## 0. 適用範圍與強制遵循要求

### 0.1 適用對象與文件定位

本設計系統適用**鉅亨買基金平台旗下所有產品**。

#### 文件定位

本文件記錄「跨產品可重用」的設計與工程規範，不記錄單一產品的商業規則、數字公式或一次性 demo workaround。

| 類型 | 應放位置 | 判斷基準 |
|---|---|---|
| 平台通用 UI 規則 | `docs/DesignSystem.md` | 多個產品或多個頁面會重複使用，例如色彩、字級、間距、表單、按鈕、Tabs、Table、Mobile card |
| 產品規格與數字口徑 | 各產品專案 spec | 只屬於特定產品或特定流程，例如 FreePay 的 Pay 出門檻、贖回公式、年化提醒條件 |
| Demo 實作歷程 | 專案內獨立紀錄 | 用來說明設計推動、決策演化、AI 協作與工程化過程，不作為平台規範 |
| 短期 workaround | 不應直接寫入設計系統 | 只為解決單一 demo 畫面、尚未確認跨產品適用性 |

### 0.2 設計系統化原則

1. **先判斷語意，再決定元件**：外觀看起來相似不代表語意相同。例如 tab、segmented control、radio group 都可能是橫向選項，但用途不同。
2. **先盤查使用情境，再抽共用規則**：同一 UI 模式若出現在多個頁面，需先列出使用處、差異與限制，再沉澱為共用規範。
3. **先穩定畫面，再推進抽象**：若現有頁面尚未穩定，不應為了設計系統化一次大範圍重構。
4. **共用規範要能跨專案維護**：新增規則時需考量 Angular Material v14、未來 V15 / MDC 升級、RWD、可及性與既有元件影響。
5. **產品規格不混入設計系統**：設計系統只定義 UI 表達、互動行為與工程結構；產品公式、門檻、條件與商業文案放在產品 spec。

### 0.3 元件選型與 Angular Material 使用原則

#### 元件選型三層框架

設計與工程討論新元件時，先依三層框架判斷，不直接以「看起來像哪個元件」決定實作方式。

| 層級 | 選型 | 適用情境 | 原則 |
|---|---|---|---|
| 1 | 原生 HTML + token | 外觀為主、互動單純，例如卡片、資料列、badge、chip、搜尋 input、提示區塊、靜態標題 | 不引入 Material 依賴；用語意化 HTML、設計 token 與平台 class 控制外觀 |
| 2 | Angular Material + 設計系統 class | 需要 Material 協助互動、狀態或可及性，例如 button、radio、checkbox、toggle group、tab nav、dialog、tooltip、select、date picker | 使用 Material 官方元件標籤、directive 與 input API，保留 disabled、focus、keyboard、ripple、ARIA 等內建行為；平台外觀加在語意 class 或外層 wrapper，不直接改壞 Material 基底或深層 DOM |
| 3 | 自訂設計系統元件 | 跨頁重複、Material 不符合產品語意或結構，例如資料表格、基金卡、底部 action bar、注意事項、年化提醒卡 | 抽成平台 class 或 Angular component，讓結構、RWD、狀態與文案規則可跨專案重用 |

簡化判斷：**複雜互動用 Material，純視覺結構用原生，跨頁重複且 Material 不合語意時抽成自訂設計系統元件。**

#### 第 2 層：Angular Material v14 使用原則

Angular Material v14 只用於需要複雜行為的元件，不是所有 UI 的預設基底。採第 2 層時遵守：

1. 先確認 Material v14 是否已有符合語意的元件與官方結構。
2. 優先使用官方 input、appearance、color、disabled、selected 等狀態 API。
3. 若需要平台視覺樣式，優先加在外層 wrapper 或設計系統 class，不直接鎖定 Material 內部 DOM。
4. 若必須覆寫 Material 內部 selector，需在設計或工程評估中標註原因、作用範圍與未來 V15 / MDC 升級風險。
5. 不得因單一 demo 畫面需要，新增會影響全平台的全域 selector。

#### Material 升級風險與維護原則

V14 升級到 V15 / MDC 時，Material 內部 DOM 與 class 可能改名或重組。設計系統需保留升級彈性：

- 不深度覆寫 `.mat-*` 內部結構。
- 平台外觀加在語意 class 或外層 wrapper，例如 `.ds-action-button`。
- 純視覺結構優先用原生 HTML + token，不為外觀強行套 Material。

### 0.4 強制遵循規則

> **本文件為平台級設計規範來源，所有新產品與功能開發必須以此為準。**

| 規則 | 說明 |
|---|---|
| 禁止自行定義色票 | 不得在元件樣式中直接寫入未收錄於本文件的 HEX 色碼 |
| 優先使用 Token | 引用顏色時，一律使用本文件定義的 Token，不直接寫 hardcoded HEX |
| 元件依三層框架選型 | 不預設全部以 Angular Material 為基底。先依〈元件選型三層框架〉判斷：純視覺結構用原生 HTML + token；複雜互動用 Angular Material + 設計系統 class；跨頁重複且 Material 不合語意時抽成自訂設計系統元件 |
| 按鈕層級遵循 §3 | 任何按鈕的角色與視覺樣式，須符合 §3 元件的按鈕規範，不得自創新層級 |
| 字型遵循字體規範 | 所有中文介面文字一律使用 Noto Sans TC；字級與行高遵循 §2 Typography Scale |
| 間距遵循 4px grid | 新增元件與頁型的 padding、margin、gap 原則上使用 4px 倍數，例外需能說明視覺或元件限制 |
| 避免覆寫 Material 內部 class | 不直接覆寫 `.mat-*` 內部結構；若必須覆寫，需確認 v14 寫法、影響範圍與未來 MDC 風險 |

### 0.5 新增或修改規範的流程

1. 若現有規範無法滿足設計或實作需求，**不得直接新增規則或自行補到文件中**，必須先提出待確認項目，經設計與前端雙方確認後才可實施
2. 此規則適用於所有範圍，包含顏色、字級、間距、元件、互動、RWD、資料呈現、文案格式與例外情境
3. 影響既有元件的修改，須列出受影響元件清單並通知開發團隊

---

## 1. 色彩系統

**高對比原則（長輩友善）**：平台使用者以長輩為主，文字以高對比優先。

本章列出的 Hex 僅作為色票對照；實作時必須使用 Token，不得在元件樣式中直接寫入 Hex。

### 1.1 品牌色

#### Primary — 主色（品牌行動）

| Token | Hex | 階 | 用途 |
|---|---|---|---|
| `--color-brand-primary-50` | `#FFF0EC` | 最淡 tint | 品牌淡底、選取淡底、錯誤 light ring、品牌提示框底色 |
| `--color-brand-primary-100` | `#FCCFBE` | hover 淡底 | 品牌 hover 淡底、輕量提示背景 |
| `--color-brand-primary-200` | `#F9A98F` | border tint | 品牌淡邊框、已完成 step 淡色狀態 |
| `--color-brand-primary-300` | `#F47355` | hover 過渡色 | 輔助 hover、品牌狀態過渡；主要 hover 仍優先用 `--color-brand-primary-600` |
| `--color-brand-primary-400` | `#F04D29` | **base 主色** | 主要按鈕、主要行動、選取狀態、品牌重點數字、Input error border |
| `--color-brand-primary-600` | `#C23B1A` | strong | 主要按鈕 hover、pressed 前一層、錯誤訊息、14px 品牌小字 |
| `--color-brand-primary-800` | `#8C240D` | deepest | 主要按鈕 pressed、淡品牌底上的強文字 |

#### Secondary — 次色（Warning）

| Token | Hex | 階 | 用途 |
|---|---|---|---|
| `--color-brand-secondary-50` | `#FFF8EE` | 最淡 tint | Warning 提示底色 |
| `--color-brand-secondary-100` | `#FDDFA6` | highlight tint | Highlight 底色 |
| `--color-brand-secondary-200` | `#FCC974` | border tint | Warning / highlight 淡邊框 |
| `--color-brand-secondary-300` | `#FBB754` | icon / accent | 輔助 icon、局部 accent |
| `--color-brand-secondary-400` | `#FAA634` | **base 次色** | 次要品牌輔助色；需注意白字對比不足，不作主要文字底色 |
| `--color-brand-secondary-600` | `#C87F1A` | strong | Warning 邊框、warning hover |
| `--color-brand-secondary-800` | `#7A4A08` | deepest | Warning 淡底上的文字 |

#### Tertiary — 第三色（Info／連結）

| Token | Hex | 階 | 用途 |
|---|---|---|---|
| `--color-brand-tertiary-50` | `#E8F8F9` | 最淡 tint | Info 提示底色、focus light ring |
| `--color-brand-tertiary-100` | `#A8E4E8` | border tint | Info 邊框、淡 icon 背景 |
| `--color-brand-tertiary-200` | `#70D4DA` | decorative tint | 輕量裝飾線、輔助邊框 |
| `--color-brand-tertiary-300` | `#3EC2CF` | **base 第三色** | Input focus border、選中邊框、連結色（需搭配 underline） |
| `--color-brand-tertiary-400` | `#2A9BAA` | hover / info strong | Info icon hover、可互動說明 icon hover、資訊強調 |
| `--color-brand-tertiary-600` | `#1E7480` | strong | 小字連結、visited、inline link |
| `--color-brand-tertiary-800` | `#124D55` | deepest | Info 淡底上的文字 |

### 1.2 中性灰階

| Token | Hex | 類 | 用途 |
|---|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | 背景 | 頁面主背景、卡片底色、品牌色按鈕文字 |
| `--color-neutral-50` | `#F8F8F8` | 背景 | 次要背景、輸入框底色、已上傳檔案列表底色 |
| `--color-neutral-100` | `#F2F2F2` | 背景 | Hover 底色、disabled 背景、表頭底色 |
| `--color-neutral-150` | `#E6E6E6` | 邊框 | 卡片邊框、分隔線、disabled border |
| `--color-neutral-200` | `#D9D9D9` | 邊框 | 輸入框預設邊框、Ghost / Outline 按鈕預設邊框 |
| `--color-neutral-250` | `#CCCCCC` | 狀態 | Disabled 文字、低可用狀態 |
| `--color-neutral-300` | `#B3B3B3` | 邊框 | 輸入框 hover 邊框、Ghost / Outline hover 邊框 |
| `--color-neutral-400` | `#999999` | 文字 | Placeholder、helper text、非重要輔助文字（14px 以上） |
| `--color-neutral-500` | `#808080` | 文字 | 表格輔助資訊、弱標籤 |
| `--color-neutral-600` | `#666666` | 文字 | 低優先 meta／輔助說明（label／互動文字採 `#333333`，見高對比原則）|
| `--color-neutral-700` | `#4D4D4D` | 文字 | 次要標題、強輔助資訊 |
| `--color-neutral-800` | `#333333` | 文字/背景 | 次要／label／互動文字（高對比原則）；footer 等深色區塊底色 |
| `--color-neutral-850` | `#262626` | 背景 | header 等深色導覽底色 |
| `--color-neutral-900` | `#1A1A1A` | 文字 | 主要內文、輸入文字、表格儲存格、區塊／卡片／頁面標題、大數字 |
| `--color-neutral-950` | `#0D0D0D` | 文字 | 高對比標題，需謹慎使用 |
| `--color-neutral-1000` | `#000000` | 特殊 | 特殊高對比需求，謹慎使用 |


### 1.3 狀態與資料色

| Token | Hex | 說明 | 用途 |
|---|---|---|---|
| `--color-price-up` | `#CF1322` | 台灣市場漲色，來源：PlatformRules.md §2.5 | 用於報酬率、漲跌幅與金額型損益等正向績效資料 |
| `--color-price-down` | `#389E0D` | 台灣市場跌色，來源：PlatformRules.md §2.5 | 用於報酬率、漲跌幅與金額型損益等負向績效資料 |


**設計筆記**  
好
`#CF1322` 與 `#389E0D`，符合台灣市場「紅漲綠跌」慣例，且在白底上的辨識度更穩定。此組色彩主要用於報酬率、漲跌幅與金額型損益等績效數字，因此需優先考量表格、小字與長時間閱讀情境的清晰度。

### 1.4 陰影與遮罩

陰影分三層階層，依元素浮起層級選用；遮罩用於對話框背景。

| Token | 值 | 類 | 用途 |
|---|---|---|---|
| `--shadow-sm` | `0 2px 12px rgba(0, 0, 0, 0.08)` | 陰影 | 低層級：嵌入式卡片、確認區塊、輕浮起元素 |
| `--shadow-md` | `0 6px 24px rgba(0, 0, 0, 0.12)` | 陰影 | 中層級：浮起卡片、展開區、清單群組 |
| `--shadow-lg` | `0 8px 40px rgba(0, 0, 0, 0.18)` | 陰影 | 高層級：對話框、彈窗、modal panel |
| `--color-overlay-scrim` | `rgba(0, 0, 0, 0.45)` | 遮罩 | 對話框背景遮罩 |


### 1.5 色彩使用規則

- 實作時一律使用本文件 Token，不直接寫 hardcoded HEX。
- 若色彩系統已定義用途，優先依用途使用。
- 若找不到合適的顏色或狀態，不得自行新增色票或規則，需先提出確認。
- 同一元件的 Default / Hover / Focus / Pressed / Disabled / Error / Selected 狀態需依本文件既有狀態表，不得局部自創。
- 只有績效變動資料使用漲跌顏色，包含報酬率、漲跌幅與金額型損益。已投入金額、已領取金額、市值、成本等非績效變動欄位不因正負值套用漲跌色。`-`、`—`、空值與 `0` 不套漲跌顏色。

---

## 2. 文字排版規範（Typography）

### 2.1 字體家族

| Token | 值 | 用途 |
|---|---|---|
| `--font-primary` | `'Noto Sans TC', 'Roboto', sans-serif` | 全站唯一字型 |

---

### 2.2 字級階層（Type Scale）

桌機／手機字級由大到小如下（單位 px）：

| 層級 | 桌機 | 手機 | weight | line-height | 用途 |
|---|---:|---:|---:|---:|---|
| Display | `48` | `32` | `700` | `1.25–1.4` | 首屏主視覺大標，少量使用 |
| H1 | `36` | `28` | `700` | `1.25–1.4` | 頁面主標題 |
| H2 | `28` | `22` | `700` | `1.25–1.4` | 主要區塊標題 |
| H3 | `20` | `18` | `700` | `1.25–1.4` | 小節標題、流程頁標題 |
| H4 | `18` | `16` | `500` | `1.25–1.4` | 卡片／側欄／區塊內標題、`.block-title` |
| Body LG | `18` | `16` | `400` | `1.7–1.8` | 長篇閱讀段落、較大內文 |
| Body | `16` | `16` | `400–700` | `1.7–1.8` | 主要內文、表格儲存格、輸入值 |
| Body SM | `14` | `14` | `400–600` | `1.5–1.7` | 表單 label、helper、輔助說明、訂單內文、表格表頭 |
| Mini | `—` | `12` | `400–500` | `normal` | 手機極次要 meta、badge、tag、step number |

> **斷點與最低字級**：手機 `≤ 767px`（最小 `12px`，僅極次要 meta／badge／tag／step number）、桌機 `≥ 768px`（最小 `14px`，不用 12px）；新增斷點或特殊縮放需先提出確認。
>
> weight 為範圍者，低值＝預設、高值＝強調加粗（如金額、重點數字、加粗 label）。
>
> **行高例外**：line-height 欄為標題／內文情境的預設；按鈕、tab、chip、input、表格儲存格與數字一律改用 `normal` 或由元件高度垂直置中（避免數字列高度不一）。
>
> **letter-spacing 預設 0**：除品牌字樣或經確認的裝飾標籤外，文字、表單、按鈕、數字皆不加字距。

---

### 2.3 閱讀文字與段落

僅規範閱讀型文字（長文、說明段落），不套用於按鈕、表單欄位、表格儲存格、卡片統計值等 UI 元件。

- **行寬**：長段落約 `32–36` 個中文字，過寬時限制內容寬度。
- **字級／行高**：用 Body 或 Body SM；長文閱讀採較鬆行高 `1.7–1.8`（比表單 helper 等短文鬆）。
- **段距**：段落間以一個行距分隔、不加裝飾線；標題下方保留明確間距，不貼近內文。

---

### 2.4 數字資料格式

本節規範數字、金額、百分比與日期的顯示格式。

#### 通用規則（金額、百分比、單位數、日期共用）

| 規則 | 說明 | 範例 |
|---|---|---|
| 千分位 | 加逗號 | `1,000,000` |
| 等寬數字 | 數字欄一律 `font-variant-numeric: tabular-nums` | — |
| 表格對齊 | 數字欄置中；文字數字混欄依主型態決定、同頁一致 | — |
| 不截斷 | 金額、報酬率、日期、契約編號不可截斷；不足時換行或調欄寬 | — |
| 正負號 | 正值不顯示 `+`；負值用 `-`、不用括號 | `3.52%`、`-1.20%`、`-台幣 500` |
| 阿拉伯數字 | UI 文字中的數量一律阿拉伯數字 | `近3個月`、`共5筆`、`最多10檔`（✗ 中文數字）|
| `0` vs `-` | `0`＝真實零值；`-`（U+002D，禁 `—`／`–`／空字串）＝有資料但無參考意義、或無資料 | `台幣 0`、`-` |

> **`0` vs `-`**：同欄避免混用；若一語意同時可對應 `0` 與 `-`，以 spec 為準。

#### 小數位數與幣別

| 型別 | 規則 | 範例 |
|---|---|---|
| 台幣金額 | 取整數位 | `台幣 10,000` |
| 外幣金額 | 最多 2 位小數，去除尾零 | `美元 500`、`美元 500.5`、`美元 500.25` |
| 百分比 | 固定 2 位小數 | `3.52%`、`-1.20%` |
| 單位數 | 最多 4 位小數，去除尾零 | `8,000`、`30.5`、`95.2381` |
| 淨值（NAV）| 最多 4 位小數，去除尾零；不前綴幣別（伴隨計價幣別欄呈現）| `10.5`、`16.2045` |

> **幣別**：一律中文幣別名（台幣／美元／日圓），不用 `$`／`NT$`／`USD`。
> **去除尾零**：以 `toLocaleString({ maximumFractionDigits: N })` 等邏輯實作，**不得 `.toFixed(N)`** 造成 `8,000.0000` 視覺垃圾。

#### 日期與時間

| 情境 | 格式 | 範例 |
|---|---|---|
| 一般日期 | `YYYY/MM/DD` | `2026/03/21` |
| 含時間 | `YYYY/MM/DD HH:mm` | `2026/03/21 14:30` |
| 相對時間（近期）| 中文相對描述 | `3 天前`、`剛剛` |
| 申購截止 | 日期＋時間＋時區 | `2026/03/21 14:00（台灣時間）` |


---

### 2.5 文案精簡原則

說明性文字——Label、placeholder、helper、錯誤訊息、提示、注意事項、按鈕文案——一律以**精簡**為原則：用最少的字講清楚，不堆禮貌詞、不重複已知資訊。

| 原則 | 範例 |
|---|---|
| 不複述脈絡：同區塊已出現的欄位名／單位／情境，子文案不再重複 | Label「每月 Pay 金額」→ placeholder「輸入金額」（✗「請輸入每月 Pay 金額」）|
| 去贅詞：能省的「請」「您的」「相關」「進行」先省 | 「請輸入金額，範圍為 台幣 1–1,250」→「輸入金額，範圍 台幣 1–1,250」|
| 一句一重點：拆短句，不寫長串複合句 | — |

適用於全平台**任何涉及說明的地方**；新增文案時先自問「這句能不能更短」。

---

## 3. 元件

### 3.1 共用狀態與互動行為

> 所有互動元件共用同一套狀態語言。本節定義**共通行為**；各元件章只列「自己有哪些狀態、對應哪個 token」，不重複定義行為。

| 狀態 | 共通行為 | 色（語意，詳 §1）|
|---|---|---|
| Default | 元件靜止樣式 | 依元件 |
| Hover | 游標移入回饋；中性元件**收緊邊框、文字加深**，不主動上品牌色 | 邊框 `Neutral 300`、文字 `Neutral 800` |
| Focus | 鍵盤／點擊聚焦；加**可見 focus ring**（無障礙必須，不得移除）| 邊框 `Tertiary 300` ＋ ring `0 0 0 3px Tertiary 50` |
| Pressed | 按下瞬間，底色再加深一階 | 品牌類 `Primary 600 → 800` |
| Selected／Active／Checked | 已選中；品牌色標示（邊框＋填色或淡底）| `Primary 400`（淡底 `Primary 50`）|
| Disabled | 不可互動、降彩度；`cursor: not-allowed`，不觸發 hover／focus 回饋 | bg `Neutral 100/150`、文字 `Neutral 250` |
| Error | 驗證失敗；紅框＋紅字＋紅光暈 | 邊框／字 `Primary 400/600` ＋ ring `0 0 0 3px Primary 50` |

**跨元件規則**

- **中性身份元件 hover 依 Hover 列**：segmented、卡片型單選、幣別／門檻選擇、篩選 pill、描邊圓鈕、Outline·中性按鈕等；**品牌身份按鈕（Filled、Outline·品牌）與導覽 tab 不受此限**（走品牌軸 hover，見 §3.2）。
- **選取控制項（radio／checkbox）互動**：整個可點區（含 label）一律 `cursor: pointer`；hover 以 ripple 圓形光暈（外擴 `8px`、不擴及文字列）回饋、不改邊框色；Material v14 預設與本規則不一致時以本規則覆寫。

---

### 3.2 按鈕

**用途**：一顆按鈕 ＝ 變體（顏色層級）＋ 形態（外形）＋ 尺寸，三者對應下面三表自由組合；變體顏色與狀態跨形態、跨表面共用。

**HTML**

```html
<!-- 變體＝class；Material：flat/raised→Filled、stroked→Outline -->
<button mat-flat-button color="primary" class="ds-action-button">申購</button>       <!-- 主要 Filled -->
<button mat-stroked-button class="ds-action-button">取消</button>                    <!-- 次要 Outline·中性 -->
<button mat-stroked-button color="primary" class="ds-action-button">立即申購</button> <!-- 次要 Outline·品牌 -->
<button class="ds-text-button">清除</button>                                        <!-- 最低 Text -->
```

**形態**（同一表面內形態一致；圖示鈕——圓形、無框——獨立見 §3.3）

| 形態 | 圓角 |
|---|---|
| 膠囊 | `999px` |
| 圓角 | `8px` |

**尺寸**（膠囊／圓角適用）

| 級 | Height | Padding | Font | Min-width | 場景 |
|---|---|---|---|---|---|
| SM | `36px` | `8px 20px` | `14px / 500` | `88px` | 緊湊（對話框並列、桌機密集）|
| MD | `44px` | `12px 24px` | `14px / 500` | `88px` | 標準（預設，觸控友善）|
| LG | `56px` | `16px 48px` | `16px / 500` | `160px` | 頁面主 CTA、hero |

**狀態**（變體 × 狀態；`—` ＝ 無此狀態；HEX ↔ token 見 §1）

| 層級 | 變體 | 用途 | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|---|---|
| **主要** | Filled 填充 | 送出、確認、申購、下一步、頁面主 CTA | bg `#F04D29`、白字 | bg `#C23B1A` | bg `#8C240D` | bg `#E6E6E6`、字 `#CCCCCC` |
| **次要** | Outline 描邊·中性 | 預設選擇：取消、返回 | 透明、邊 `1px #D9D9D9`、字 `#333333` | 邊 `#B3B3B3`（字不變、無底色）| bg `#E6E6E6` | 邊 `#E6E6E6`、字 `#CCCCCC` |
| **次要** | Outline 描邊·品牌 | 品牌強調：淺底「立即申購」 | 透明、邊 `1px #F04D29`、字 `#F04D29` | bg `#FFF0EC` | — | 邊 `#E6E6E6`、字 `#CCCCCC` |
| **次要** | Outline 描邊·白 | 深底／品牌底上 | 透明、邊 `1px #FFFFFF`、字 `#FFFFFF` | 疊白 `10%`（半透）| — | 邊 `#E6E6E6`、字 `#CCCCCC` |
| **最低** | Text 文字 | 純文字操作：清除、每頁筆數、頁首登出 | 透明、無框、字 `#333333` | 字加深至 `#1A1A1A`（深底則 `#FFFFFF`）| — | 字 `#CCCCCC` |

**排列與規則**

- **按鈕組排列**：桌機／平板水平、置中；手機各佔 50%、主按鈕在右；DOM 次要在前（不用 `order`，確保 Tab 順序）。

---

### 3.3 圖示鈕（Icon Button）

**用途**：以 icon 表達動作或狀態的按鈕。三形態依用途選，沿用 §3.2 變體配色（顏色與狀態見 §3.2）。

**HTML**

```html
<button class="ds-icon-button" aria-label="展開"><i class="bi bi-chevron-down"></i></button>        <!-- 無框 -->
<button class="circle-btn circle-btn--brand-outline" aria-label="篩選"><i class="bi bi-funnel"></i></button> <!-- 描邊圓 -->
<button class="circle-btn circle-btn--buy" aria-label="申購">BUY</button>                           <!-- 實心圓 -->
```

**類型**（皆 `32×32`、icon `16`；icon-only 必填 `aria-label`）

| 類型 | 外形 | 沿用變體 | 用途 |
|---|---|---|---|
| 無框圖示 | 無框無底 | Text（字 `#333333`、hover `#1A1A1A`）| 展開／收合、關閉、內聯小動作 |
| 描邊圓 | 圓框 `1px`、`50%` | Outline·中性／品牌 | 篩選 trigger、排序、次要圓形動作 |
| 實心圓 | 填滿 `50%` | Filled（品牌）| 主要圓形動作、`BUY`／`SELL` 短字標 |

**選中／作用中**：用 **icon 填滿**（描邊圓 ＋ 實心 icon）表示；**整顆填滿（實心圓）保留給主要動作**，不用於選中，以免撞臉。例：篩選有套用 ＝ 描邊圓 ＋ 實心漏斗。

**icon 選用**（每顆都要指定 glyph；常用對照，Bootstrap Icons）

| 功能 | glyph |
|---|---|
| 展開／收合 | `chevron-down` / `chevron-up` |
| 關閉 | `x-lg` |
| 篩選 | `funnel`（有套用 `funnel-fill`）|
| 排序 | `arrow-down-up` |
| 更多 | `three-dots` |
| 檢視切換 | `grid-1x2` / `list-ul` |

**短字標例外**：實心圓可放 `BUY`／`SELL` 短字標——採英文（品牌慣例）；`14px` 溢出可用 `12px / 700`（僅此例覆寫「桌機不得 12px」）。

---

### 3.4 Filter Chip（篩選 Pill）

**用途**：列表／搜尋／彈窗篩選，多選。

**HTML**

```html
<div class="filter-chips" role="group" aria-label="基金類型篩選">
  <button type="button" class="chip" [class.is-selected]="isSel(c)"
          *ngFor="let c of categories" (click)="toggle(c)">{{ c }}</button>
</div>
```

**尺寸**

| Class | chip 高 | padding | 字級 | gap | 圓角 | 場景 |
|---|---|---|---|---|---|---|
| `.filter-chips`（基底）| `32px` | `6px 10px` | `14px` | `8px` | `999px` | 篩選列 |
| `.filter-chips--sheet` | `30px` | `6px 7px` | `12px` | `6px` | `999px` | 手機 sheet（`12px` 限手機，見 §2.2）|


**狀態**（`—` ＝ 同 Default；HEX ↔ token 見 §1）

|  | Default | Hover | Selected | Selected + Hover |
|---|---|---|---|---|
| 底 | `#FFFFFF` | — | `#FFF0EC` | `#FCCFBE` |
| 邊 | `#D9D9D9` | `#B3B3B3` | `#F04D29` | `#F04D29` |
| 字 | `#333333` | — | `#F04D29` | `#F04D29` |
| 字重 | `400` | — | `700` | `700` |

**收合／展開**：容器 `.filter-chips` 為 `flex`，切換 `flex-wrap`——收合 `nowrap`（截斷）、展開 `wrap`（全顯）。

**維護**：chip 尺寸／狀態只由 `.filter-chips` 及 modifier 控制，頁面不覆寫單顆 chip；需既有以外的尺寸，新增 modifier 補入本節。

---

### 3.5 Segmented Control（Toggle 選取按鈕）

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

### 3.6 Tabs（頁籤）

> 本節套用前文〈元件選型與 Angular Material 使用原則〉通則於 tab：tab 的「行為」（導覽列的鍵盤操作、無障礙焦點、配路由）值得交給 Material，「純視覺切換」則用原生 button + token。據此 tab 分兩類，底層刻意不同。

#### 先分語意：兩類 tab，底層刻意不同

外觀相似不代表語意相同。tab 先分兩類，底層**故意採用不同實作**：

| 情境 | 底層 | 全域 class | 為什麼這樣選 |
|---|---|---|---|
| **頁面主導覽**（切換整頁區塊／配路由） | `mat-tab-nav-bar` + `mat-tab-link` | `.ds-tab-nav--page` | Material 幫你管 active 狀態、鍵盤導覽、無障礙焦點；且它內部 DOM 簡單（就是 `<a>`），需要覆寫的內部 class 少，升級風險可控。例：帳戶總覽 / 委託查詢 / 已實現損益 / 設定異動。 |
| **內容切換**（同一份資料換顯示欄組） | 語意化 `<button role="tab">` + `*ngIf` 自控顯隱 | `.ds-content-tab` | 內容切換用 `*ngIf` 自己控就好，不需要 Material 的內容投影。**純 button 完全不碰 Material 內部，V15 升級零負擔**；也避免 `mat-tab-nav-panel` 包覆內容區造成表格 / 卡片 / footer / RWD 破版。例：基金搜尋的績效表現 / 最新淨值 / 年度報酬率 / 年度最大跌幅。 |
| **同區塊互斥設定值（不是 tab）** | `mat-button-toggle-group` / radio | — | 外觀像橫向選項，但語意是「單選設定」不是「頁籤」。例：Pay 出方式「依金額 / 依比例」、門檻類型「市值守護 / 增值啟動」。不使用任何 tab class。 |

#### 為什麼內容切換 tab 不用 `mat-tab-nav-bar`

這是刻意的工程取捨，理由有四：

1. **語意錯置**：`mat-tab-nav-bar` 本質是「導覽列」（設計給路由用），用在同頁內容切換是把導航語意誤用。
2. **破版風險**：它要搭 `mat-tab-nav-panel` 包覆內容，會改變內容區 DOM 流，可能讓既有表格、手機卡片、footer、sticky 區塊破版。
3. **升級負債**：MDC 化（V15）後內部 class 整批改名，你越深度客制它的視覺，升級越痛。
4. **根本不需要**：內容切換本來就用 `*ngIf` 控顯隱，用不到 Material 的面板機制——多引入一層 Material 只是徒增依賴。

#### 樣式變體

| Class | 用途 | 視覺規格 |
|---|---|---|
| `.ds-tab-nav` | 頁面導覽 tab 基底 | 負責 flex、底線、與 Material `mat-tab-nav-bar` 對齊。不可單獨代表尺寸。 |
| `.ds-tab-nav--page` | 頁面主導覽 | link 高度 `64px`；文字 `20px`；手機高度 `48px`、文字 `14px`。 |
| `.ds-content-tab` | 內容切換 tab（tablist 容器） | 語意化 button tablist，不依賴 Material。底線 `1px`；item 文字 `16px`、權重 `500`，active 權重 `700` + 品牌色底線。 |

> 兩類共用同一組視覺語言（底線高亮、active 字重 `700`、色 `secondary → primary`、`tabular` 字距），確保跨專案視覺一致；差異只在「底層元件」與「尺寸」。

#### 標準 CSS（落地時照此，集中於設計系統層）

```scss
// 頁面主導覽：基於 Material mat-tab-nav-bar，僅覆寫必要外層
.ds-tab-nav { display: flex; align-items: stretch; justify-content: space-between;
  gap: 16px; border-bottom: 1px solid var(--color-border-default); }
.ds-tab-nav .mat-tab-nav-bar { flex: 1; min-width: 0; border-bottom: none; }
.ds-tab-nav--page .mat-tab-link { height: 64px; padding: 0 32px;
  font-family: var(--font-primary); font-size: 20px; opacity: 1; }
.ds-tab-nav .mat-tab-link.mat-tab-label-active { color: var(--color-action-primary); font-weight: 700; }
@media (max-width: 767px) {
  .ds-tab-nav--page .mat-tab-link { height: 48px; padding: 0 14px; font-size: 14px; }
}

// 內容切換：語意化 button tablist，零 Material 內部依賴
.ds-content-tab { display: flex; align-items: flex-end; gap: 24px;
  border-bottom: 1px solid var(--color-border-default); }
.ds-content-tab__item {
  padding: 10px 4px; white-space: nowrap;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--color-text-secondary); font-size: 16px; font-weight: 500;
  cursor: pointer; transition: color .12s, border-color .12s;
}
.ds-content-tab__item:hover { color: var(--color-text-primary); }
.ds-content-tab__item.is-active {
  color: var(--color-action-primary);
  border-bottom-color: var(--color-action-primary); font-weight: 700;
}
@media (max-width: 767px) { .ds-content-tab { overflow-x: auto; } }
```

#### 實作範例

頁面主導覽（Material nav-bar）：

```html
<div class="ds-tab-nav ds-tab-nav--page">
  <nav mat-tab-nav-bar [tabPanel]="tabPanel" color="primary">
    <a mat-tab-link [active]="activeTab === 'overview'" (click)="activeTab = 'overview'">帳戶總覽</a>
    <a mat-tab-link [active]="activeTab === 'order'" (click)="activeTab = 'order'">委託查詢/取消</a>
  </nav>
</div>
<mat-tab-nav-panel #tabPanel><!-- page content --></mat-tab-nav-panel>
```

內容切換（語意化 button tablist，內容用 `*ngIf` 自控）：

```html
<div class="ds-content-tab" role="tablist">
  <button class="ds-content-tab__item" type="button" role="tab"
          [class.is-active]="activeTab==='perf'" (click)="setTab('perf')">績效表現</button>
  <button class="ds-content-tab__item" type="button" role="tab"
          [class.is-active]="activeTab==='nav'" (click)="setTab('nav')">最新淨值</button>
</div>
<!-- 內容區直接用 *ngIf 切換，不需要 mat-tab-nav-panel -->
<div *ngIf="activeTab==='perf'"><!-- 績效表格 --></div>
<div *ngIf="activeTab==='nav'"><!-- 淨值表格 --></div>
```

#### 導入前檢查

替換或新增 tab 前，先確認：

1. 該區塊是「頁籤」還是「單選設定 / 篩選 / 狀態切換」？是後者就用 toggle / radio，不套任何 tab class。
2. 是頁面導覽還是內容切換？兩者底層不同，先分對類別再選 class。
3. 是否有右側工具列（列表 / 卡片切換、排序）？可在外層用頁面 layout flex 容納，tab 本體仍只用標準 class。
4. 手機是否需要水平捲動？捲動區不應吃掉頁面主要寬度。

#### 維護規則

- Tab 樣式只允許集中在設計系統層（`styles.scss` 或未來共用 library），不得在單一 component 內重複覆寫 `.mat-tab-link` 或自刻一套同語意 tab。
- 既有私有 tab（如 fund-select 的 `fs-tab`）收斂時，**只把 class 名對齊到 `.ds-content-tab`，不動 DOM 結構與 TS 邏輯**，風險極低。
- 既有頁面導入需一頁一頁替換與驗收，不得一次跨多頁套用。
- V15 / MDC 升級時，只需集中檢查 `.ds-tab-nav` 對 Material 內部 selector 的覆寫；`.ds-content-tab` 不依賴 Material，無需檢查。
- **待清理**：`styles.scss` 早期預留的 `.ds-tab-nav--content`（基於 nav-bar 做內容 tab）為過時方向、目前無頁面使用，應移除並改用 `.ds-content-tab`。

---

### 3.7 Input（輸入框）

#### 結構與標題

- **標題（Label）一律置頂常駐**，不使用 Material 浮動 label。浮動 label 未輸入時停在框內，會讓空欄位看起來像已填、看不出可輸入。
- 由上到下：**Label → 輸入框 → Helper／Error**（兩者擇一，有錯時 Error 取代 Helper）。
- 必填以 Label 旁紅色 `*` 標示。

#### 兩種變體（設計師依版面彈性選用）

| 變體 | 外觀 | 適用 |
|---|---|---|
| 外框 | 四邊 `1px` 邊框、`8px` 圓角、高 `44px`、白底 | 需明確「可輸入」邊界、單獨站立的欄位 |
| 底線 | 僅 `2px` 底線、高 `40px`、透明底 | 欄位密集、避免「滿版框線」時的輕量選擇 |
| 搜尋型膠囊 | 四邊 `1px` 邊框、`999px` 膠囊圓角、高 `40px`、白底，可含右側 attached icon action | 搜尋列、篩選工具列、與 chips 並列的關鍵字輸入 |

- 兩變體標題皆置頂、狀態色共用下表 token。
- focus：外框加 `--color-input-shadow-focus` 光暈；底線僅變底線色、不加光暈。

#### 搜尋型膠囊 Input

搜尋型 input 用於「搜尋與篩選」工具列，視覺語言需與 Filter Chips（§3.4）一致。當搜尋框與 chips 同區出現時，搜尋框不得使用偏方角外框，應改用膠囊圓角，讓整組工具看起來屬於同一組控制項。

**結構規則**

| 區段 | 規格 |
|---|---|
| 外層容器 | `display: flex`、`align-items: center`、`height: 40px`、`border: 1px solid --color-input-border-default`、`border-radius: 999px`、白底 |
| input | `flex: 1`、無內建邊框、透明底、左右 padding `12px`、字級 `16px` |
| 清除按鈕 | 有輸入值時顯示於 input 右側，透明 icon button，寬 `32px` |
| 搜尋 action | 置於最右側 attached icon button，寬約 `40–44px`，右側維持膠囊圓角 |
| focus | 外層容器變 `--color-input-border-focus`，並使用 `--color-input-shadow-focus` |

**使用規則**

- 搜尋 action 優先使用放大鏡 icon，不用「搜尋」文字按鈕，以避免輸入框與按鈕分離。
- 搜尋 action 若附著在輸入框右側，需和輸入框共用同一外輪廓；不可再做成外部獨立按鈕。
- 若搜尋框與 chips 位於同一篩選列，兩者圓角皆使用膠囊語言（`999px` / 半高全圓）。
- Placeholder 可承擔搜尋範圍說明，例如「請輸入基金名稱或品牌關鍵字」；但若外部 label 已明確提供欄位名稱，仍需避免重複冗字。

```html
<label class="search-input">
  <input class="search-input__field" placeholder="請輸入基金名稱或品牌關鍵字">
  <button class="search-input__clear" type="button" aria-label="清除搜尋">
    <i class="bi bi-x-circle-fill"></i>
  </button>
  <button class="search-input__action" type="button" aria-label="搜尋">
    <i class="bi bi-search"></i>
  </button>
</label>
```

```css
.search-input {
  display: flex;
  align-items: center;
  height: 40px;
  border: 1px solid var(--color-input-border-default);
  border-radius: 999px;
  background: var(--color-input-bg);
}

.search-input:focus-within {
  border-color: var(--color-input-border-focus);
  box-shadow: var(--color-input-shadow-focus);
}

.search-input__field {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 0 12px;
  font: inherit;
}

.search-input__action {
  width: 42px;
  height: 40px;
  border: 0;
  border-left: 1px solid var(--color-input-border-default);
  border-radius: 0 999px 999px 0;
  background: var(--color-action-primary);
  color: var(--color-text-on-brand);
}
```

#### 狀態 token

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

#### 實作原則

- 基本文字／數字／密碼輸入採**原生 `<input>` + 本節 token，不包 `mat-form-field`**。依 §0「行為交給 Material、外觀交給 token」：這類欄位 Material 行為價值低、其外觀（浮動 label／底線／infix）難對齊本規範，且 `appearance="standard"` 已於新版 Material 淘汰；自訂可完全對齊且不受改版牽動。
- 僅**行為型複合輸入**（如日期區間選擇器）保留 Material，外觀盡量對齊上述變體。
- 狀態色一律以本節 token 為準。

#### Placeholder 與文案

- Placeholder 僅給格式提示，**不複述 Label 欄位名**（Label 已置頂提供）。例：Label「每月 Pay 金額」→ placeholder 寫「輸入金額」，不用「請輸入每月 Pay 金額」。
- **不得出現「（選填）」**；必填／選填由 Label 旁 `*` 區分。選填欄位若無格式提示，placeholder 可留空。
- 欄位前後綴（幣別、百分比等）只在需求明確時加入，不預設補上。

### 3.8 Upload 區域狀態（含已上傳檔案列表）

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

### 3.9 Radio

| Token | Hex | 用途 |
|---|---|---|
| `--color-input-radio-border` | `#999999` | 未選取邊框 |
| `--color-input-radio-checked` | `#F04D29` | 選取狀態邊框與填充色 |
| `--color-input-radio-ripple` | `#FFF0EC` | Hover 圓形光暈背景 |

- **選取狀態**：內部填入實心圓點。

### 3.10 Checkbox

| Token | Hex | 用途 |
|---|---|---|
| `--color-input-checkbox-border` | `#999999` | 未選取邊框 |
| `--color-input-checkbox-checked` | `#F04D29` | 選取狀態背景與勾選色 |
| `--color-input-checkbox-ripple` | `#FFF0EC` | Hover 圓形光暈背景 |

- **選取狀態**：背景填滿並顯示白色勾選符號。

### 3.11 Inline Hint Panel

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
  padding: 0 16px;
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-150);
  border-radius: 8px;
  color: var(--color-neutral-600);
  font-size: 14px;
  line-height: 1.75;
  opacity: 0;
  transform: translateY(-4px);
  transition: max-height .22s ease, margin .22s ease, padding .22s ease, opacity .16s ease, transform .22s ease;
}

.hint-panel.is-open {
  max-height: 240px;
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 12px 16px;
  opacity: 1;
  transform: translateY(0);
}
```

### 3.12 固定日日期格狀選擇器

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
  gap: 8px;
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

---

## 4. 圖標規範（Icon）

### 4.1 圖標來源

所有產品頁面的圖標一律使用 **Bootstrap Icons**。設計稿可引用 [Figma Community Bootstrap Icons](https://www.figma.com/design/E4Hy6FPJGIgixZGuSd5psU/Bootstrap-Icons--Community-?node-id=0-1&t=6cKtW0ma1ePplkKs-1)，實作時需保留 Bootstrap Icons 原始 icon name。

- Icon 名稱需保留 Bootstrap Icons 原始命名，例如 `bi-info-circle`、`bi-arrow-left`。
- 禁止混用 Material Icons、Font Awesome 或臨時自繪 SVG。
- 若 Bootstrap Icons 沒有符合需求的圖示，需先提出確認，不得自行新增圖示風格。

### 4.2 使用原則

- 圖示需輔助操作或資訊辨識，不作無意義裝飾。
- 同一頁同一語意需使用同一 icon。
- 文字按鈕若有對應常見操作 icon，可搭配 icon 使用。

### 4.3 尺寸規範

| 使用情境 | 建議尺寸 |
|---|---|
| 行內文字旁（inline） | 16×16px |
| 按鈕內圖示 | 20×20px |
| 標題 / 功能入口 | 24×24px |
| 大型裝飾圖示 | 32×32px 以上 |

### 4.4 顏色規範

- 圖示顏色繼承所在元件的 CSS token，不得使用 hardcoded HEX
- 漲跌圖示（如上漲箭頭、下跌箭頭）必須遵循 PlatformRules.md 第 2.5 節色彩規定

---

## 5. 版面與間距

### 5.1 頁型容器寬度

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

### 5.2 間距與留白

平台間距採用 `4px` grid。所有新元件與新頁型的 `padding`、`margin`、`gap`、固定寬高與容器間距，原則上需使用 `4px` 的倍數，讓版面節奏、欄位對齊與 RWD 收合行為一致。

**基準規則**

| 類型 | 規則 |
|---|---|
| 最小可感知間距 | `4px`，用於文字與輔助資訊、icon 與文字、緊密元素之間 |
| 小型元件間距 | `8px`，用於 label / input / helper、radio / checkbox 群組、按鈕內 icon 與文字 |
| 欄位或資訊列間距 | `12px` / `16px`，用於同一表單群組、同一資訊區塊內的資料分隔 |
| 區塊內 padding | `16px` / `20px` / `24px`，依資訊密度與頁型決定 |
| 區塊間距 | `24px` / `32px`，用於不同內容群組、不同卡片或流程段落之間 |
| 大型頁面段落 | `40px` 以上，僅用於頁面主要段落或大型分區，不用於密集交易流程 |

**留白層級**

留白需用來表達資訊層級，不應只是把畫面撐開。同一層級的留白要一致，不同層級的留白要有明確差距。

| 層級 | 建議間距 | 使用情境 |
|---|---|---|
| 元件內部 | `4px` / `8px` | icon 與文字、label 與欄位、欄位與 helper |
| 同組內容 | `12px` / `16px` | 同一表單區、同一試算資料區、同一列表列內資訊 |
| 不同內容群組 | `24px` / `32px` | 表單區與注意事項、輸入區與試算區、卡片與卡片 |
| 頁面主要區塊 | `40px` 以上 | 頁面段落、總覽區與下方列表、非交易型內容分段 |

**產品情境密度**

- 申購、贖回、設定異動屬於交易流程，留白應清楚但不可過鬆，避免使用者需要大量捲動才完成操作。
- 帳戶總覽、查詢、列表屬於掃描型頁面，需優先維持資料可比較性與欄位對齊，避免使用過大的段落留白。
- 說明頁或行銷內容可使用較大的段落留白，但仍需遵守 `4px` grid 與容器規則。

**例外規則**

- 字級、行高、字距不受 `4px` grid 強制限制，但需遵循 §2 Typography。
- icon 視覺置中、Material 元件內建位移、border 寬度、focus ring 可因元件需求使用非 4 倍數。
- 若因視覺校正需要使用非 4 倍數間距，需能說明目的；不得為了快速對齊而任意使用 `5px`、`6px`、`10px`、`14px`、`18px` 等零散值。
- **px 長度一律整數**：所有長度值（含上方可不受 4px grid 限制的 border 寬度、focus ring、字距等）不用小數，`1.5px`、`0.5px` 一律取相鄰整數。非長度的合法小數（rgba 透明度、行高倍數、§2.4 財務數據格式）不在此限。
- 卡片型容器預設 `border-radius: 8px`；pill、圓形按鈕、modal / bottom sheet 可依元件規格使用不同圓角。

## 6. 資料表格（Table）

平台所有資料列表（帳戶總覽、委託查詢、已實現損益、設定調整、異動紀錄等）一律使用 **`div` + CSS grid** 結構，不使用 `<table>`。原因：表頭與每一資料列共用同一組 `grid-template-columns`，欄位天然對齊；手機可用 `grid-template-areas` 把同一份結構轉成單列卡片，不必為手機另寫一套 DOM。

此為平台標準元件，所有新表格必須引用本節結構與 class 命名，欄寬與內容子欄數透過 `.grid-table--<變體>` modifier 定義，不得各頁自行發明表格樣式。

### 6.1 結構與語意

每一列固定切成三段，由左到右：

| 區段 | class | 內容 | 桌機定位 |
|---|---|---|---|
| 識別欄 | `.grid-id` | 代碼（次要灰）＋ 名稱（標題黑） | 固定欄寬 |
| 內容欄 | `.grid-body` | 數據欄位，子欄數由變體決定，數字置中 | `1fr` 彈性 |
| 操作欄 | `.grid-actions` | 按鈕（設定 / 委託 / 申購等） | 固定欄寬 |

表頭 `.grid-head` 與資料列主體 `.grid-main` 共用同一 `grid-template-columns`，因此表頭文字與下方資料天然對齊。

**欄寬標準（跨變體一致，不得各表自訂）**

- **識別欄固定 `280px`，`@media (max-width: 1024px)` 收為 `200px`**（基金 code＋name 在此斷點仍可單行）。所有資料表格用同一組值與同一斷點，不可某張表設成別的寬度。
- **內容欄固定 `1fr`**，吸收剩餘寬度；子欄數由各變體 `.grid-body` 的 `grid-template-columns` 決定。識別欄維持 280 不會擠到內容欄，因內容欄為彈性。
- **操作欄依按鈕數固定**：單顆 `88px`、多顆（如帳總設定＋委託＋申購）`172px`。
- 多選列表（如委託查詢）在識別欄前再加 `36px` 選取欄，識別欄上述寬度規則不變。

```html
<div class="grid-table grid-table--settings">
  <!-- 表頭 -->
  <div class="grid-head">
    <span class="grid-id-head">基金</span>
    <div class="grid-body">
      <span>月 Pay 金額</span><span>Pay 出方式</span><span>扣款日</span>
      <span>計價幣別</span><span>狀態</span>
    </div>
    <span class="grid-actions-head">設定</span>
  </div>

  <!-- 資料列 -->
  <div class="grid-row">
    <div class="grid-main">
      <div class="grid-id">
        <span class="grid-code">TA123456</span>
        <span class="grid-name">統一大滿貫多重資產平衡證券投資信託基金 A 類型</span>
      </div>
      <div class="grid-body">
        <span data-label="月 Pay 金額">5,000</span>
        <span data-label="Pay 出方式">依金額</span>
        <span data-label="扣款日">每月 15 日</span>
        <span data-label="計價幣別">台幣</span>
        <span data-label="狀態">正常</span>
      </div>
      <div class="grid-actions">
        <button class="circle-btn" type="button" aria-label="設定">
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>
  </div>
</div>
```

### 6.2 顏色與分隔

| 用途 | Token | 值 |
|---|---|---|
| 表頭底色 | `--color-neutral-150` | `#E6E6E6` |
| 表頭強分隔線（表頭與內容之間） | `2px` `--color-neutral-250` | `#CCCCCC` |
| 資料列間分隔線 | `1px` `--color-border-default` | `#E6E6E6` |
| 名稱（主文字） | `--color-text-heading` | `#1A1A1A` |
| 代碼、欄位標題、次要文字 | `--color-text-secondary` | `#666666` |
| 漲 / 跌數字 | 依 §1.3 狀態色（台股紅漲綠跌） | — |

- 表頭文字 `14px`、次要灰；名稱 `16px`、`font-weight: 500`、標題黑；代碼 `14px`、次要灰。
- 數字欄位一律 `text-align: center`，並套 `min-width: 0` 允許橫向壓縮。
- 禁止 hardcoded HEX；表頭灰階（150 / 250）屬表格表頭專用階，與 `bg-muted`、`border-strong` 區隔。

### 6.3 間距

- 識別欄左 padding 與操作欄右 padding **對稱**，皆為 `20px`，讓首末欄內容對齊卡片左右緣。
- 資料列 `.grid-main` 上下 padding 與欄間 `gap` 為 `20px`（依密度可用 `16` / `24`，遵守 §5.2 的 `4px` grid）。
- 表頭 `.grid-head` 上下 padding `12px`。

**首末欄邊距判準：欄內容靠邊對齊才需要 padding，純置中數據表不需要**

`20px` 邊距的本質是「給靠邊對齊的內容防貼邊」，不是為了卡片邊界統一。據此分兩類：

| 表型 | 首/末欄內容 | 邊距 |
|---|---|---|
| 有識別欄／操作欄（如帳總、已實現損益明細）| 識別欄 code+name **靠左**、操作欄按鈕**靠右** | **要** `padding-left/right: 20px`，防貼邊 |
| 純數據表（如交易明細、已實現損益總覽）| 每欄皆**置中** | **不要**——置中本身首末格就有半格留白、不貼邊；再加 padding 只會讓數據往內縮、首末格被壓窄 |

註：無操作欄但首欄是靠左識別欄的表（如已實現損益明細），末欄雖是置中數據，仍需在內容欄補 `padding-right: 20px` 與左側識別欄對稱。

### 6.4 列分隔策略

多列數據表桌機一律用**斑馬紋**（偶數列 `--color-bg-subtle` 底）助橫向閱讀，不用列間 border 分隔線：

- 套在資料列主體：`.grid-table--X .grid-row:nth-of-type(even) .grid-main { background: var(--color-bg-subtle); }`。
- **`grid-row` 一律為 `<article>`**，`nth-of-type(even)` 才能避開 `grid-head`(div) 的計數（否則斑馬紋會錯位）。
- 可展開列表（帳戶總覽、已實現損益、異動歷史）的斑馬紋同時兼作「展開明細與所屬列的層級區隔」。
- 手機卡片各自獨立成區塊，不套斑馬紋（偶數列灰底規則在手機因卡片本身已是 `bg-subtle` 而無視覺影響）。

### 6.5 內容欄雙排（子欄過多時）

當內容欄欄位數較多、單排會過窄時，改為上下兩排，**中間只用一條 `border-bottom`（`1px` `--color-neutral-250`）分隔**，不要每欄各畫一條直立分隔線——後者在含換行長名的列會因 subpixel 對位產生粗細不一致。

```css
.grid-body--2row { display: flex; flex-direction: column; }
.grid-body-row { display: grid; align-items: center; }
.grid-body-row--top { padding-bottom: 8px; border-bottom: 1px solid var(--color-neutral-250); }
.grid-body-row--bottom { padding-top: 8px; }
```

### 6.6 手機卡片化

斷點 `767px` 以下，表頭隱藏，每列轉為一張卡片，結構對齊帳戶總覽（灰卡片頭 + 白底資料塊）：

- `.grid-row` 變圓角**灰底**卡片（`border-radius: 12px`、`--color-bg-subtle`）。
- `.grid-main` 用 `grid-template-areas` 垂直堆疊；識別欄（含多選選取欄）留在灰底卡片頭。
- **資料區 `.grid-body` 包成白底圓角塊**（`--color-bg-base`、`border-radius: 8px`、`padding: 0 14px`），與灰卡片頭形成層級區隔（對齊帳總 `ov-fund-extra`）。
- 白底塊內每列：`min-height: 52px`、`padding: 10px 0`、「標題在左／值在右」（標題用 `::before { content: attr(data-label) }`，故每個資料 `span` 必須寫 `data-label`），底線 `1px` `--color-border-default` 分隔、末列無線；值靠右、漲跌色不變。
- 多選列表的選取欄 checkbox 置於灰卡片頭左側。
- 桌機合併的欄（如「生效／委託日」雙行）在手機可用 `.grid-only-desktop` / `.grid-only-mobile` 切換成各自獨立列。

**兩類手機卡片（依是否有識別頭）**

卡片底色一律灰（`bg-subtle`），凸顯於白色頁面/彈窗背景；差別在內層：

- **有識別頭的表**（帳總、已實現損益明細）：**雙層**——灰卡片頭（識別欄基金名）＋ 白底資料塊（上述）。兩層用來區隔「識別 vs 數據」。
- **純數據表**（交易明細、總覽）：**單層**——`grid-row` 維持灰底，`grid-body` 透明（去掉白塊的 bg/radius/padding）、數據直接排在灰卡上。無識別頭就不需要二級層次，單層省空間。

> **未來筆記（多筆數時可改展開模式）**：純數據表筆數變多時，單層卡片會讓手機列表很長。此時可考慮改為「識別頭 ＋ 展開收合」（例如交易明細以「交易類型＋日期＋金額」為識別頭，淨值/單位數/匯率收進展開），用折疊換取短列表。判斷時機——以自由 Pay 為例，大額用戶持續多年 Pay 出，**光「自由 Pay 出」這類一年就約 12 筆**，多年累積後交易明細筆數可觀，屆時展開模式的掃描效率優勢會浮現。

**幣別彙總卡的手機呈現：少用垂直全可見、多用輪播**

按幣別彙總的卡片（如已實現損益總覽）手機呈現，依幣別數量選擇：

- **少（2–3 種，常態）**：**垂直堆疊全可見**（grid-table 單層灰卡）。一次看到所有幣別、不漏看，且單套 DOM。預設採此。
- **多（4 種以上）**：可改**橫向輪播**（`scroll-snap` + dots）省垂直空間——但需額外手機 DOM、且有漏看後段卡片的風險，僅在幣別種類確實多時才採用。

> 對照：帳戶總覽頂部的持有市值幣別彙總（`ov-sum-cards`）用輪播，是因為它要多幣別並列比較、又與其他內容共處一頁、需省空間；已實現損益總覽是獨立頁、幣別少、重逐筆檢視，故用垂直全可見。判準回到「**省空間 vs 全可見/不漏看**」的取捨。

### 6.7 空狀態

無資料時顯示 `.grid-empty`（`padding: 40px 0`、置中、次要灰文字），不留空白表格。

### 6.8 變體 modifier

欄寬與內容子欄數由 `.grid-table--<變體>` 定義，例如設定調整：

```css
.grid-table--settings {
  .grid-head, .grid-main { grid-template-columns: 280px 1fr 88px; }
  .grid-body { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
```

新增表格時只需新增一個 modifier 指定三欄欄寬與內容子欄數，其餘結構、顏色、間距、手機行為皆由 `.grid-table` 基底提供。

**多選列表（前導選取欄）`--order`**

需要多選（如委託查詢配合「取消委託」）的表格，在識別欄前加 `40px` 選取欄 `.grid-select` 放 checkbox。**`40` ＝ MDC checkbox 的 state-layer 寬**，checkbox 填滿置中、ripple 圓圈與方框對齊（窄於 40 會溢出使 ripple 偏移）；並隱藏 44px touch-target。手機移到灰卡片頭左側。

```css
.grid-select ::ng-deep .mat-mdc-checkbox-touch-target { display: none; } // 去 44px 觸控區

.grid-table--order {
  .grid-head, .grid-main { grid-template-columns: 40px 280px 1fr; } // 選取 40 / 識別 280 / 內容 1fr
  .grid-id, .grid-id-head { padding-left: 0; }
}
.grid-table--order-alt .grid-body { grid-template-columns: repeat(6, minmax(0, 1fr)); }

@media (min-width: 768px) {            // 最左選取、最右內容都補 padding 20（見無操作欄通則）
  .grid-table--order .grid-head,
  .grid-table--order .grid-main { padding-left: 20px; padding-right: 20px; }
}
@media (max-width: 1024px) {           // 識別欄收 200，同 §6.1
  .grid-table--order .grid-head,
  .grid-table--order .grid-main { grid-template-columns: 40px 200px 1fr; }
}
@media (max-width: 767px) {
  .grid-table--order .grid-main {
    grid-template-columns: auto 1fr !important;   // !important 蓋過 base 手機固定欄寬
    grid-template-areas: "select id" "body body"; // checkbox 在卡片頭左側
  }
  .grid-table--order .grid-select { grid-area: select; align-self: start; }
}
```

**純數據表變體（`--tx` 交易明細、`--profit-sum` 總覽）**

每欄皆置中數據、無識別頭：`grid-main` 單段、`grid-body` 放 N 欄等分。手機用**單層灰卡**（`grid-row` 灰底、`grid-body` 透明去白塊、`grid-main` 收為單一 `"body"` area＋`gap: 0`）。

**識別＋排序＋折疊變體（`--change` 異動歷史）**

識別欄 ＋ N 數據欄 ＋ 表頭可排序（`.grid-sortable` 掛 click 與排序 icon）＋ 手機折疊（後段欄用 `.change-more` 控制收合/展開顯隱、`grid-row` 掛 `.is-expanded`）。

**無操作欄的 padding 通則**

`grid-table` 基底靠識別欄 `padding-left: 20` ＋ 操作欄 `padding-right: 20` 形成左右對稱。**無操作欄的表**（已實現損益明細/總覽、交易明細、異動歷史、委託查詢）最後一欄是內容，需在 `@media (min-width: 768px)` 補 `padding-right: 20`；委託查詢最左是選取欄，連 `padding-left: 20` 一起補。手機一律用卡片內距、不補。

### 6.9 標準樣式（基底）

```css
.grid-table { display: flex; flex-direction: column; }

.grid-head {
  display: grid;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
  background: var(--color-neutral-150);
  border-bottom: 2px solid var(--color-neutral-250);
  color: var(--color-text-secondary);
  font-size: 14px;
}
.grid-id-head { padding-left: 20px; }
.grid-actions-head { text-align: center; }

.grid-row { border-bottom: 1px solid var(--color-border-default); }

.grid-main {
  display: grid;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.grid-id {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 20px;
  min-width: 0;
}
.grid-code { font-size: 14px; color: var(--color-text-secondary); }
.grid-name { font-size: 16px; font-weight: 500; line-height: 1.4; color: var(--color-text-heading); }

.grid-body {
  display: grid;
  align-items: center;
  min-width: 0;

  > span { min-width: 0; text-align: center; }
}

.grid-actions { display: flex; align-items: center; justify-content: center; }

.grid-empty { padding: 40px 0; text-align: center; color: var(--color-text-secondary); }

@media (max-width: 767px) {
  .grid-table { gap: 12px; }
  .grid-head { display: none; }

  .grid-row {
    border-bottom: 0;
    border-radius: 12px;
    background: var(--color-bg-subtle);
    overflow: hidden;
  }

  .grid-main {
    grid-template-columns: 1fr auto;
    grid-template-areas: "id id" "body body" "actions actions";
    gap: 10px;
    padding: 14px;
  }

  .grid-id { grid-area: id; padding-left: 0; }

  // 資料區包白底圓角塊（對齊帳總 ov-fund-extra）
  .grid-body {
    grid-area: body;
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0 14px;
    background: var(--color-bg-base);
    border-radius: 8px;

    > span {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 52px;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border-default);
      text-align: right;

      &::before { content: attr(data-label); color: var(--color-text-secondary); text-align: left; }
      &:last-child { border-bottom: none; }
    }
  }

  .grid-actions { grid-area: actions; justify-content: flex-start; }
}

/* 多選選取欄、雙行值、桌機/手機切換欄 */
.grid-select { display: flex; align-items: center; justify-content: center; }
.grid-stack { display: flex; flex-direction: column; align-items: center; min-width: 0; }
.grid-stack .grid-sub { margin-top: 4px; font-size: 14px; color: var(--color-text-secondary); }
.grid-only-mobile { display: none; }
@media (max-width: 767px) {
  .grid-only-desktop { display: none; }
  .grid-only-mobile { display: flex; }
}
```

> 註：`.grid-only-mobile/.grid-only-desktop` 的顯示切換在實作中以變體 class 提高 specificity（如 `.grid-table--order .grid-only-mobile`），以蓋過手機 `.grid-body > span` 的 `display: flex`。

### 6.10 展開收合（保留彈性）

資料列未來若需展開看明細，沿用帳戶總覽的容器模式，**不改既有結構**：

- `.grid-row` 是卡片容器；在 `.grid-main`（收合時的單列）後再加一層 `.grid-extra` 展開區。
- `.grid-extra` 對齊帳總 `ov-fund-extra`：桌機與 `.grid-main` 共用同一 `grid-template-columns`（明細落在內容欄）；手機為白底圓角塊。
- 展開/收合以 `.grid-id` 內的 chevron 按鈕切換，狀態 class（如 `.is-expanded`）掛在 `.grid-row`。

**因此設計表格時，`.grid-row` 一律保留為容器層、`.grid-main` 為單列，不要把資料直接掛在 `.grid-row` 上**，以免日後加展開區時需重構。目前委託查詢即依此結構（`.grid-row > .grid-main`），具備展開彈性。
