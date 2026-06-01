# Angular Demo Project Guideline

本文件記錄 demo 專案轉為 Angular 專案時的執行準則。作為每個專案建立 demo、交付工程與提供畫面分享時的共用參照。

## 核心結論

Demo 專案應以 Angular 專案作為主要維護來源，並以目前線上的正式版作為功能流程與交易邏輯的主要參考。

轉為 Angular 後，設計師畫面調整應在 Angular component、SCSS 與 mock data 中進行；工程師拿到的也會是可理解的 Angular Material v14 結構，而不是只能觀看的靜態 HTML。

需要分享畫面給他人瀏覽時，不能直接打開 Angular 原始碼，而是要先執行 build，將 build 後的靜態檔推到 GitHub Pages 或指定的分享位置。

`npm run start` 與 `npm run build` 是不同用途：

- `npm run start`：啟動本機開發伺服器，用來自己預覽與檢查畫面。執行後會提供本機網址，例如 `http://127.0.0.1:4200`。
- `npm run build`：產出可部署的靜態檔，用來放到 GitHub Pages 或交付分享位置。它不會啟動網站，也不會提供預覽網址。

後續日常維護流程會變成：

```bash
# 進入要維護的 Angular 專案
cd products/{ProductName}/projects/{Version}/angular-demo

# 本機預覽畫面，確認調整是否正確
npm run start

# 畫面確認後，提交 Angular 原始碼
git add 要提交的檔案
git commit -m "這次修改說明"
git push origin main
```

push 到 `main` 後，由 GitHub Actions 自動執行部署用 build，並更新 GitHub Pages。日常維護時不需要手動提交 `dist/`。

此做法的目的：

- 讓 demo 不只是畫面示意，而是接近正式工程可理解的結構。
- 讓設計調整集中在 Angular component、SCSS 與 mock data 中維護。
- 讓工程師能清楚對應 Angular component、Angular Material v14 元件與 icon 使用方式。
- 讓對外分享的畫面可透過自動化 build 結果穩定更新。

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
| 消費層 | `component.html` | 引用全域 class 與局部結構 class，不自創設計語言 |

任何在兩個以上 component 出現的視覺模式，屬於設計語言，寫入 `styles.scss`；component SCSS 只處理該頁面獨有的版面。

component HTML 可以使用局部結構 class，例如某頁專用的排列容器或區塊控制；但不得在局部 class 中自行定義品牌色、狀態色、字級、圓角等設計語言。若需要新的視覺規則，應先回到設計系統確認。

### 專案啟動時必先建立

在寫第一個 component 之前，先在 `styles.scss` 完成以下三項：

1. **設計系統 token** → CSS custom property。任何 component 禁止出現 hardcode HEX。
2. **Material theme `@include`** → 集中定義，不分散到各 component。
3. **跨 component 共用 class** → 導覽列、區塊標題、注意事項等視覺模式。

Material 元件狀態覆蓋應集中在 `styles.scss` 或明確的共用 class 下；避免在多個 component 重複覆蓋同一個 Material internal selector，造成樣式權重疊加與狀態色不一致。

### Material 元件顏色屬性規則

每次使用 Material 元件，顏色屬性必須明確寫出，不依賴 Material 預設值：

| 元件 | 規則 |
|---|---|
| `mat-raised-button` | `color="primary"` |
| `mat-stroked-button` | 不加 color |
| `mat-checkbox` | `color="primary"` |
| `mat-slide-toggle` | `color="primary"` |
| `mat-form-field` | `appearance="fill" color="accent"` |
| `mat-button-toggle-group` | 加明確 class，狀態色由該 class 統一控制；不得使用 Material 預設藍色 |

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

若遇到設計系統未定義的顏色、字級、間距、元件狀態或互動規則，不得直接補成正式規則；需先標記為專案暫用或提出確認，再決定是否回寫設計系統。

### 修改前的一致性對齊原則

修改或新增任何 UI 元素前，必須先讀取同頁面語意最接近的現有實作，對齊其用詞、排列、間距、色彩與元件選擇，不得自行判斷。找不到對應實作時，明確說明並請用戶確認。

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

## GitHub 分享與部署

原則上每個產品各自開一個獨立的 GitHub repo，Angular 專案的原始碼推到該 repo 的 `main` branch。

不同產品的部署彼此獨立。若 FreePay 已能正常部署，下一次建立或部署其他產品（例如超底王）時，只需要處理該產品自己的 Angular 專案、repo、Workflow 與 GitHub Pages 設定，不需要回頭修改 FreePay。既有專案只有在部署壞掉、要統一新標準，或要整理共用架構時，才需要回頭調整。

若未來改採多產品共用同一個 repo，Workflow 必須明確指定該產品的 `working-directory`、dependency cache path 與部署 `folder`，避免不同產品互相影響。

Angular 原始碼無法直接瀏覽，必須先 build 成靜態檔才能上線。建議透過 GitHub Actions 自動化這個步驟，設定完成後日常只需 push 原始碼即可。

- `npm run start`：啟動本機預覽（`http://127.0.0.1:4200`），只有自己看得到，不影響線上版本。
- `npm run build`：一般 production build，用來確認專案是否能正常打包。
- `npm run build:pages`：GitHub Pages 部署專用 build，需帶上 `--base-href /repo-name/`，由 CI 自動執行，日常不需要手動跑。

### 第一次設定（每個新 repo 做一次）

**Step 1 — 設定 `package.json` build script**

建議將一般 build 與 GitHub Pages build 分開：

```json
"build": "ng build --configuration production",
"build:pages": "ng build --configuration production --base-href /repo-name/"
```

`/repo-name/` 對應 GitHub repo 名稱，例如 FreePay repo 填 `/FreePay/`。

拆成兩個 script 的原因：

- `build`：一般用途，不綁 GitHub Pages 路徑，適合本機或 CI 檢查 production build 是否正常。
- `build:pages`：部署用途，專門給 GitHub Pages 使用。若缺少 `--base-href /repo-name/`，部署後頁面可能因找不到 JS / CSS 而空白。

已經能正常部署的既有專案，不需要因為這條規則立刻回頭修改。新專案建立時優先採用此寫法；既有專案可在下次整理部署流程或需要一致化時再調整。

**Step 2 — 建立 Workflow 設定檔**

從現有 repo 複製 `.github/workflows/deploy.yml` 到新 repo 的相同位置，修改以下三處路徑為新專案的實際路徑：

- `cache-dependency-path`
- `working-directory`（Install 與 Build 兩個 step）
- `folder`（Deploy step）

每次 push 到 `main` 時自動觸發部署用 build，並推送至 `gh-pages` branch。若 `package.json` 有 `build:pages`，Workflow 的 Build step 應執行：

```bash
npm run build:pages
```

若既有專案目前是透過 `npm run build` 部署，且 `build` script 已包含正確的 `--base-href`，可以先維持現況，不影響其他新專案部署。

**Angular clean URL 與 GitHub Pages 重新整理**

這個問題不是因為多了一個 build 才發生，而是因為 Angular SPA、乾淨 URL 與 GitHub Pages 靜態部署放在一起時，本來就會遇到的限制。

Angular 真正的入口只有一個 `index.html`。像 `/FreePay/demo/overview`、`/FreePay/demo/redeem` 這類網址，是 Angular Router 在瀏覽器裡切出來的前端路由，不是 GitHub Pages 上真的存在一個 `demo/overview/index.html` 檔案。

所以從 GitHub Pages 的 `Visit site` 進到 `/FreePay/` 會正常，因為 root 有 `index.html`。但如果在 demo 裡切到某個乾淨 URL 後按瀏覽器重新整理，GitHub Pages 會先把那個 URL 當成真實檔案路徑去找；找不到檔案時，就會出現 GitHub Pages 的 404。

GitHub Pages 不能像一般 web server 一樣設定「所有路由都 rewrite 到 `index.html`」。比較適合這個 demo 的做法，是 build 完後把 `index.html` 複製成同一份 `404.html`。這樣使用者重新整理乾淨 URL 時，GitHub Pages 雖然先走到 404 fallback，但實際回傳的內容仍是 Angular app，Angular Router 接手後就能回到正確畫面。

這不是把每個頁面都複製一份，也不是把很多 route 產生成實體檔案；只是部署產物裡多一個 `404.html`，內容跟 `index.html` 一樣。每次部署都會覆蓋線上的 `gh-pages` 內容，所以線上只保留最新版；真正的版控與還原紀錄在 Git commit 裡。

這個做法不衝突「`main` 只放原始碼、`dist/` 不提交」的原則。`404.html` 是 GitHub Actions 在部署產物中自動產生，不需要手動複製，也不需要提交到 `main`。

**Step 3 — 在 GitHub 開啟 Pages**

進入 GitHub repo → Settings → Pages，將 Source 設為 `gh-pages` branch（root）。設定完成後無需再調整。

### 日常維護流程

```bash
# 1. 本機預覽，確認畫面正確
npm run start

# 2. 確認後提交原始碼
git add 要提交的檔案
git commit -m "這次修改說明"
git push origin main
# → GitHub Actions 自動 build 並在約 1–2 分鐘內更新 GitHub Pages
```

`main` branch 只存放原始碼，`dist/` 資料夾不需提交。

若發現設計規範需要補充，應更新設計系統文件；若發現流程或交付方式需要調整，應更新本文件。

## 注意事項

- 每次實作前都要確認目前線上的正式版。
- 不要把設計規範、Angular 執行準則與單一專案規格混在同一份文件。
- 若專案需要對外分享，需先確認 GitHub Pages 指向位置與 build 輸出位置一致。
