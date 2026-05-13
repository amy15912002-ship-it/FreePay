# Angular Demo Project Guideline

本文件記錄 demo 專案轉為 Angular 專案時的執行準則。作為每個專案建立 demo、交付工程與提供畫面分享時的共用參照。

## 核心結論

Demo 專案應以 Angular 專案作為主要維護來源，並以目前線上的正式版作為功能流程與交易邏輯的主要參考。

轉為 Angular 後，設計師畫面調整應在 Angular component、SCSS 與 mock data 中進行；工程師拿到的也會是可理解的 Angular Material v14 結構，而不是只能觀看的靜態 HTML。

需要分享畫面給他人瀏覽時，不能直接打開 Angular 原始碼，而是要先執行 build，將 build 後的靜態檔推到 GitHub Pages 或指定的分享位置。

`npm run start` 與 `npm run build` 是不同用途：

- `npm run start`：啟動本機開發伺服器，用來自己預覽與檢查畫面。執行後會提供本機網址，例如 `http://127.0.0.1:4200`。
- `npm run build`：產出可部署的靜態檔，用來放到 GitHub Pages 或交付分享位置。它不會啟動網站，也不會提供預覽網址。

後續維護流程會變成：

```bash
# 進入要維護的 Angular 專案
cd products/{ProductName}/projects/{Version}/angular-demo

# 本機預覽畫面，確認調整是否正確
npm run start

# 畫面確認後，產出可分享的靜態檔
npm run build

# 提交原始碼與必要的 build 結果
git add 要提交的檔案
git commit -m "這次修改說明"
git push origin main
```

此做法的目的：

- 讓 demo 不只是畫面示意，而是接近正式工程可理解的結構。
- 讓設計調整集中在 Angular component、SCSS 與 mock data 中維護。
- 讓工程師能清楚對應 Angular component、Angular Material v14 元件與 icon 使用方式。
- 讓對外分享的畫面可透過 build 結果穩定更新。

## 參考來源

每次建立或轉換 demo 前，應同時參考以下來源：

- 目前線上的正式版：確認既有功能邏輯、流程順序、欄位意義、交易規則與使用習慣。
- 專案規格文件：確認新版需求、情境範圍與流程差異。
- 設計系統文件：確認容器、間距、字級、顏色、元件與 icon 使用規則。
- 既有 demo 或設計稿：確認新版視覺方向、畫面狀態與情境資料。

正式版是功能與流程的主要依據；設計系統與新版規格則決定新版 demo 的視覺、元件與互動呈現。

## 專案結構

每個 demo 專案應建立獨立 Angular 專案資料夾，例如：

```text
products/{ProductName}/projects/{Version}/angular-demo/
```

Angular 專案應包含：

- demo 情境 routing
- 各情境頁面 component
- 共用 layout component
- 共用 UI component
- mock data
- Angular Material module 設定
- icon 使用規則
- build 與分享設定

## 實作原則

Demo 不只呈現畫面，也應讓工程師能看懂每個區塊在正式 Angular 專案中應如何落地。

主要原則：

- 以 Angular 專案作為唯一主要維護來源。
- 以 Angular Material v14 component 作為元件實作依據。
- Icon 使用 Bootstrap Icons。
- 優先確認正式版既有流程與交易邏輯。
- 視覺樣式集中在共用 SCSS、layout 或 design token 中。
- mock data 與畫面 template 分離。
- 每個 demo 情境應可獨立進入，也能從情境列表切換。
- 不以單一 HTML 長期維護多情境 demo。
- 多情境以 mock data 切換為主要方式；僅在流程架構差異大到無法共用同一 component 時，才建立獨立情境 component。

## 樣式架構與設計語言

### 三層職責分離

Angular 專案的樣式必須嚴格分層，職責不重疊：

| 層 | 檔案 | 內容 |
|---|---|---|
| 設計語言層 | `styles.scss` | Token、全域 class、Material theme override |
| 結構層 | `component.scss` | 該 component 獨有的版面、格線、間距 |
| 消費層 | `component.html` | 引用全域 class，不自創視覺語義 |

任何在兩個以上 component 出現的視覺模式，屬於設計語言，寫入 `styles.scss`；component SCSS 只處理該頁面獨有的版面。

### 專案啟動時必先建立

在寫第一個 component 之前，先在 `styles.scss` 完成以下三項：

1. **設計系統 token** → CSS custom property。任何 component 禁止出現 hardcode HEX。
2. **Material theme `@include`** → 集中定義，不分散到各 component。
3. **跨 component 共用 class** → 導覽列、區塊標題、注意事項等視覺模式。

### Material 元件顏色屬性規則

每次使用 Material 元件，顏色屬性必須明確寫出，不依賴 Material 預設值：

| 元件 | 規則 |
|---|---|
| `mat-raised-button` | `color="primary"` |
| `mat-stroked-button` | 不加 color |
| `mat-checkbox` | `color="primary"` |
| `mat-slide-toggle` | `color="primary"` |
| `mat-form-field` | `appearance="fill" color="accent"` |
| `mat-button-toggle-group` | 加全域覆蓋 class，顏色由 `styles.scss` 的 `.mode-toggle` 決定 |

### Token 語義不得混用

同一個 token 只對應一種語義：

| 用途 | Token |
|---|---|
| 可互動的主要操作（按鈕、選取態） | `--color-action-primary` |
| 財務漲 / 正報酬 | `--color-price-up` |
| 財務跌 / 負報酬 | `--color-price-down` |

### Class 設計原則

**視覺與佈局必須拆分**：若同一個 class 在不同 context 需要不同佈局行為，拆成 base class + modifier。範例：`.mode-toggle`（顏色）+ `.mode-toggle-fill`（滿版佈局）。

**全域化判斷**：同一視覺模式出現在兩個以上 component，就移入 `styles.scss`。

### 一致性驗收標準

宣稱「設計語言已對齊」需同時滿足三層：

1. **CSS class 名稱**：使用全域定義的 class，不自創視覺語義
2. **HTML 元素語義**：標題用 heading 元素（h2/h3），不用 span/div 代替
3. **HTML 內容**：icon、標點、文字格式與其他 component 一致

---

### 跨專案共用（待評估）

目前每個 Angular 專案各自維護一份 `styles.scss`（含 token + Material theme）。當第二個採用相同設計系統的 Angular 專案啟動時，應評估將 token 與 Material theme 抽成共用 Angular library 或 npm package，由各專案 import，避免 token 修改需要逐專案同步。

**評估時機**：第二個 Angular 專案開始建立時。在此之前維持現有做法即可。

---

## 建置順序

每個 demo 專案應從一開始就以 Angular 專案建立，並依照下列順序執行：

1. 確認目前線上正式版、專案規格與設計系統。
2. 建立 Angular 專案骨架。
3. 建立 routing 與頁面入口。
4. 建立共用 layout、容器規則與基礎樣式（`styles.scss` 設計語言層先就位）。
5. 先跑通主要流程，確認元件、間距、字級、顏色與互動狀態正確。
6. 確認畫面與流程後，依需求擴展其餘頁面或情境。
7. 整理共用 component、mock data 與 icon 使用方式。
8. 建立 build 與 GitHub Pages 分享流程。

## GitHub 分享流程

Angular 原始碼需要 build 後才能成為可瀏覽的靜態頁面。

本機預覽與對外分享是兩個步驟：

| 指令 | 用途 | 是否提供網址 | 產出結果 |
|---|---|---|---|
| `npm run start` | 本機預覽與調整畫面 | 會，通常是 `http://127.0.0.1:4200` | 不產出 GitHub Pages 可用檔案 |
| `npm run build` | 產出可部署靜態檔 | 不會 | 產生 `dist/` build 結果 |

### 自動部署（推薦）

透過 GitHub Actions，每次 push 到 `main` 後自動 build 並部署至 GitHub Pages，不需手動 build。

日常維護流程：

```bash
# 本機預覽確認畫面
npm run start

# 確認後提交原始碼
git add 要提交的檔案
git commit -m "這次修改說明"
git push origin main
# → GitHub Actions 自動 build 並更新 GitHub Pages
```

Workflow 設定檔位置：`.github/workflows/deploy.yml`（repo 根目錄）。

Build 結果由 GitHub Actions 自動推送至 `gh-pages` branch，`main` branch 只保留原始碼，不提交編譯後的檔案。

**首次設定**：需至 GitHub repo → Settings → Pages，將 Source 設為 `gh-pages` branch（root），之後無需再調整。

### `--base-href` 注意事項

部署至 GitHub Pages 時，`ng build` 必須加上 `--base-href /repo-name/`（依實際 repo 路徑調整），否則靜態資源路徑會錯誤導致頁面空白。此參數應直接寫入 `package.json` 的 `build` script，避免每次手動帶入：

```json
"build": "ng build --configuration production --base-href /FreePay/"
```

若同一個儲存庫中有多個 Angular 專案，各自的 `package.json` 須分別設定對應的 `--base-href`。

## 後續維護方式

Angular 專案建立完成後，後續只維護 Angular 原始碼。

維護流程：

1. 進入指定 Angular 專案資料夾。
2. 修改 Angular component、SCSS 或 mock data。
3. 執行 `npm run start`，本機啟動專案確認畫面與互動。
4. 確認後提交 Angular 原始碼，push 到 GitHub 的 `main`。
5. GitHub Actions 自動 build 並部署至 GitHub Pages（約 1–2 分鐘）。

> 不需要手動執行 `npm run build`，也不需要提交 `dist/` 資料夾。

若發現設計規範需要補充，應更新設計系統文件；若發現流程或交付方式需要調整，應更新本文件。

## 注意事項

- 每次實作前都要確認目前線上的正式版。
- 不要把設計規範、Angular 執行準則與單一專案規格混在同一份文件。
- 若專案需要對外分享，需先確認 GitHub Pages 指向位置與 build 輸出位置一致。
- 若未來其他專案也採用相同流程，可將本文件移到更高層級作為共用準則。
