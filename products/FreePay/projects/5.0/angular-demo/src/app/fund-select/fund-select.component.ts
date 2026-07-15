import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  FUNDS, Fund, FundCategory, FundRegion,
  FUND_CATEGORIES, FUND_REGIONS, FUND_BRANDS, FUND_PRICING_CCY, FUND_GROUPS, LIPPER_RATINGS, RISK_LEVELS,
} from '../mock-data/funds';

type DomicileOption = Fund['domicile'];
type PricingCcyOption = string;
type FundTab = 'perf' | 'roi' | 'drop' | 'nav' | 'rating';
type CollapsibleFilter = 'category' | 'pricingCcy' | 'brand' | 'region' | 'group' | 'lipper' | 'risk';

type SortKey =
  | 'fundId' | 'name'
  | 'perf.ytd' | 'perf.m3' | 'perf.m6' | 'perf.y1' | 'perf.y2' | 'perf.y3' | 'perf.y5' | 'stdDev'
  | 'roi.0' | 'roi.1' | 'roi.2' | 'roi.3' | 'roi.4'
  | 'drop.0' | 'drop.1' | 'drop.2' | 'drop.3' | 'drop.4'
  | 'navDate' | 'nav' | 'navChange' | 'navChangePct' | 'currency' | 'risk' | 'lipper'
  | 'stableReturn' | 'capitalPreservation' | 'esgScore';
type PerfKey = keyof Fund['perf'];
type SortOption = { key: SortKey; label: string };

@Component({
  selector: 'fp-fund-select',
  templateUrl: './fund-select.component.html',
  styleUrls: ['./fund-select.component.scss'],
})
export class FundSelectComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('chipArea', { read: ElementRef })
  private chipAreas?: QueryList<ElementRef<HTMLElement>>;

  readonly funds = FUNDS;
  readonly categories = FUND_CATEGORIES;
  readonly regions = FUND_REGIONS;
  readonly brands = FUND_BRANDS;
  readonly groups = FUND_GROUPS;
  readonly lipperRatings = LIPPER_RATINGS;
  readonly riskLevels = RISK_LEVELS;
  get searchNotes(): string[] {
    return [
      '波動度以近 1 年年化標準差表示，數值越大代表淨值波動程度越高。',
      '理柏基金評級為投資人選擇基金的重要參考，該機構將全球基金的總資產、平均年酬率、波動性、相對同類型基金的表現，以量化的方式彙總呈現。理柏提供在台灣註冊銷售的基金評級共有三種，包括「總回報、穩定回報、保本能力」，各評級指標依表現差異分五等；領先的 20% 評級為 5，之後的 20% 評級為 4，中間的 20% 評級為 3，再之後的 20% 評級為 2，最後的 20% 評級為 1。',
      `資料來源: Lipper & 投信投顧公會 & 台灣集中保管結算所。資料更新日期：${this.latestNavDate}。`,
      '各系列基金之淨值是由Lipper(資訊源)所提供，淨值可能因系統更新作業與實際狀況有所差異，相關淨值僅供參考，各系列基金之申購/贖回/轉換淨值仍應以台灣集中保管結算所資料為準，歡迎您至集保網站查詢(www.tdcc.com.tw)。'
    ];
  }
  readonly domiciles: DomicileOption[] = ['境內', '境外'];
  readonly years = [2021, 2022, 2023, 2024, 2025];
  readonly yearsDesc = this.years.map((year, index) => ({ year, index })).reverse();
  pageSize = 20;
  readonly pageSizeOptions = [20, 50, 100];
  readonly perfSortOptions: SortOption[] = [
    { key: 'perf.ytd', label: '今年' },
    { key: 'perf.m3', label: '3個月' },
    { key: 'perf.m6', label: '6個月' },
    { key: 'perf.y1', label: '1年' },
    { key: 'perf.y2', label: '2年' },
    { key: 'perf.y3', label: '3年' },
    { key: 'perf.y5', label: '5年' },
    { key: 'fundId', label: '代碼' },
    { key: 'name', label: '名稱' }
  ];
  readonly roiSortOptions: SortOption[] = [
    { key: 'roi.0', label: '2021' },
    { key: 'roi.1', label: '2022' },
    { key: 'roi.2', label: '2023' },
    { key: 'roi.3', label: '2024' },
    { key: 'roi.4', label: '2025' }
  ];
  readonly dropSortOptions: SortOption[] = [
    { key: 'drop.0', label: '2021' },
    { key: 'drop.1', label: '2022' },
    { key: 'drop.2', label: '2023' },
    { key: 'drop.3', label: '2024' },
    { key: 'drop.4', label: '2025' },
    { key: 'stdDev', label: '波動度' }
  ];
  readonly navSortOptions: SortOption[] = [
    { key: 'navChangePct', label: '日漲跌幅' },
    { key: 'navChange', label: '日漲跌' },
    { key: 'nav', label: '淨值' },
    { key: 'navDate', label: '日期' },
    { key: 'currency', label: '幣別' }
  ];
  readonly ratingSortOptions: SortOption[] = [
    { key: 'lipper', label: '理柏總回報' },
    { key: 'stableReturn', label: '穩定回報' },
    { key: 'capitalPreservation', label: '保本能力' },
    { key: 'risk', label: '風險等級' },
    { key: 'esgScore', label: 'ESG評分' }
  ];

  get pricingCurrencies(): PricingCcyOption[] {
    return FUND_PRICING_CCY;
  }

  get latestNavDate(): string {
    return this.funds
      .map(fund => fund.navDate)
      .sort((a, b) => b.localeCompare(a))[0] ?? '';
  }

  keyword = '';            // 輸入中的字（驅動建議下拉）
  appliedKeyword = '';     // 已套用的搜尋字（驅動主結果列）
  searchFocused = false;
  searchMatches: Fund[] = [];
  readonly searchMinChars = 2;
  private searchDebounce: any;   // setTimeout handle（瀏覽器/Node 型別歧義，用 any 簡化）
  brandKeyword = '';
  groupKeyword = '';
  expandedFilters: Record<CollapsibleFilter, boolean> = {
    category: false,
    pricingCcy: false,
    brand: false,
    region: false,
    group: false,
    lipper: false,
    risk: false
  };
  domicileFilters: DomicileOption[] = [];
  categoryFilters: FundCategory[] = [];
  pricingCcyFilters: PricingCcyOption[] = [];
  brandFilters: string[] = [];
  regionFilters: FundRegion[] = [];
  groupFilters: string[] = [];
  lipperFilters: number[] = [];
  riskFilters: string[] = [];

  activeTab: FundTab = 'perf';
  sortKey: SortKey = 'perf.m6';
  sortDesc = true;
  pendingSortKey: SortKey = this.sortKey;
  pendingSortDesc = this.sortDesc;
  page = 1;
  sortPanelOpen = false;
  expandedCards = new Set<string>();
  viewMode: 'card' | 'table' = 'card';   // 手機資料區：卡片（預設）／列表；桌機恆為表格，不受此值影響
  filterPanelOpen = false;
  // 每個可收合篩選列：chip 是否換行（放不下一行）→ 需顯示展開鈕
  overflowState: Record<CollapsibleFilter, boolean> = {
    category: false,
    pricingCcy: false,
    brand: false,
    region: false,
    group: false,
    lipper: false,
    risk: false
  };

  private chipObservers: ResizeObserver[] = [];
  private chipAreaChangesSub?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get filteredFunds(): Fund[] {
    const kw = this.appliedKeyword.trim().toLowerCase();
    return this.funds.filter(f => {
      if (kw && !f.fundId.toLowerCase().includes(kw) && !f.name.toLowerCase().includes(kw)) return false;
      if (this.domicileFilters.length && !this.domicileFilters.includes(f.domicile)) return false;
      if (this.categoryFilters.length && !this.categoryFilters.includes(f.category)) return false;
      if (this.pricingCcyFilters.length && !this.pricingCcyFilters.includes(f.pricingCurrency as PricingCcyOption)) return false;
      if (this.brandFilters.length && !this.brandFilters.includes(f.brand)) return false;
      if (this.regionFilters.length && !this.regionFilters.includes(f.region)) return false;
      if (this.groupFilters.length && !this.groupFilters.includes(f.group)) return false;
      if (this.lipperFilters.length && !this.lipperFilters.includes(f.lipper)) return false;
      if (this.riskFilters.length && !this.riskFilters.includes(f.risk)) return false;
      return true;
    });
  }

  // 基金搜尋建議：匹配代碼或名稱，開頭匹配優先、組內按名稱排序，上限 20 筆
  // 正式區為後端 typeahead，故經 onKeywordInput debounce 後才更新 searchMatches
  private refreshSearchMatches(): void {
    const kw = this.keyword.trim().toLowerCase();
    if (kw.length < this.searchMinChars) { this.searchMatches = []; return; }
    const startsWith = (f: Fund) =>
      f.fundId.toLowerCase().startsWith(kw) || f.name.toLowerCase().startsWith(kw);
    this.searchMatches = this.funds
      .filter(f => f.fundId.toLowerCase().includes(kw) || f.name.toLowerCase().includes(kw))
      .sort((a, b) => {
        const diff = (startsWith(a) ? 0 : 1) - (startsWith(b) ? 0 : 1);
        return diff !== 0 ? diff : a.name.localeCompare(b.name, 'zh-Hant');
      })
      .slice(0, 20);
  }

  // 將文字依目前關鍵字拆段，匹配段標記 hl=true 供下拉變色
  highlightParts(text: string): { text: string; hl: boolean }[] {
    const kw = this.keyword.trim();
    if (!kw) return [{ text, hl: false }];
    const lower = text.toLowerCase();
    const kwLower = kw.toLowerCase();
    const parts: { text: string; hl: boolean }[] = [];
    let i = 0;
    while (i < text.length) {
      const idx = lower.indexOf(kwLower, i);
      if (idx === -1) { parts.push({ text: text.slice(i), hl: false }); break; }
      if (idx > i) parts.push({ text: text.slice(i, idx), hl: false });
      parts.push({ text: text.slice(idx, idx + kw.length), hl: true });
      i = idx + kw.length;
    }
    return parts;
  }

  get sortedFunds(): Fund[] {
    const arr = [...this.filteredFunds];
    const dir = this.sortDesc ? -1 : 1;
    arr.sort((a, b) => {
      const va = this.fieldValue(a, this.sortKey);
      const vb = this.fieldValue(b, this.sortKey);
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * dir;
      return ((va as number) - (vb as number)) * dir;
    });
    return arr;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedFunds.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedFunds(): Fund[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedFunds.slice(start, start + this.pageSize);
  }

  get mobileSortOptions(): SortOption[] {
    if (this.activeTab === 'perf') return this.perfSortOptions;
    if (this.activeTab === 'roi') return this.roiSortOptions;
    if (this.activeTab === 'drop') return this.dropSortOptions;
    if (this.activeTab === 'rating') return this.ratingSortOptions;
    return this.navSortOptions;
  }

  get activeFilterCount(): number {
    // 關鍵字搜尋與篩選脫鉤，不計入篩選數
    return [
      ...this.domicileFilters,
      ...this.categoryFilters,
      ...this.pricingCcyFilters,
      ...this.brandFilters,
      ...this.regionFilters,
      ...this.groupFilters,
      ...this.lipperFilters,
      ...this.riskFilters
    ].filter(Boolean).length;
  }

  get filteredBrands(): string[] {
    const kw = this.brandKeyword.trim().toLowerCase();
    if (!kw) return this.brands;
    return this.brands.filter(brand => brand.toLowerCase().includes(kw));
  }

  get filteredGroups(): string[] {
    const kw = this.groupKeyword.trim().toLowerCase();
    if (!kw) return this.groups;
    return this.groups.filter(group => group.toLowerCase().includes(kw));
  }

  get visibleCategories(): FundCategory[] {
    return this.categories;
  }

  get visiblePricingCurrencies(): PricingCcyOption[] {
    return this.pricingCurrencies;
  }

  get visibleBrands(): string[] {
    return this.filteredBrands;
  }

  get visibleGroups(): string[] {
    return this.filteredGroups;
  }

  get emptyStateMessage(): string {
    return this.brandFilters.length
      ? '所選品牌目前沒有符合條件的基金'
      : '查無符合條件的基金';
  }

  get visibleRegions(): FundRegion[] {
    return this.regions;
  }

  private fieldValue(f: Fund, key: SortKey): number | string {
    if (key === 'fundId') return f.fundId;
    if (key === 'name') return f.name;
    if (key === 'perf.ytd') return this.perfYtd(f);
    if (key.startsWith('perf.')) return f.perf[key.split('.')[1] as PerfKey];
    if (key === 'stdDev') return f.stdDev;
    if (key.startsWith('roi.')) return f.yearRoi[Number(key.split('.')[1])];
    if (key.startsWith('drop.')) return f.yearMaxDrop[Number(key.split('.')[1])];
    if (key === 'nav') return f.nav;
    if (key === 'navChange') return f.navChange;
    if (key === 'navChangePct') return f.navChangePct;
    if (key === 'navDate') return f.navDate;
    if (key === 'currency') return f.pricingCurrency;
    if (key === 'risk') return f.risk;
    if (key === 'lipper') return f.lipper;
    if (key === 'stableReturn') return this.stableReturnRating(f);
    if (key === 'capitalPreservation') return this.capitalPreservationRating(f);
    if (key === 'esgScore') return this.esgScore(f);
    return 0;
  }

  setSort(key: SortKey): void {
    if (this.sortKey === key) this.sortDesc = !this.sortDesc;
    else { this.sortKey = key; this.sortDesc = true; }
    this.page = 1;
  }

  openSortPanel(): void {
    this.pendingSortKey = this.sortKey;
    this.pendingSortDesc = this.sortDesc;
    this.sortPanelOpen = true;
  }

  selectPendingSort(key: SortKey): void {
    if (this.pendingSortKey === key) this.pendingSortDesc = !this.pendingSortDesc;
    else { this.pendingSortKey = key; this.pendingSortDesc = true; }
  }

  applyPendingSort(): void {
    this.sortKey = this.pendingSortKey;
    this.sortDesc = this.pendingSortDesc;
    this.page = 1;
    this.closeSortPanel();
  }

  toggleSortDirection(): void {
    this.sortDesc = !this.sortDesc;
    this.page = 1;
  }

  togglePendingSortDirection(): void {
    this.pendingSortDesc = !this.pendingSortDesc;
  }

  setTab(tab: FundTab): void {
    this.activeTab = tab;
    if (tab === 'perf') {
      this.sortKey = 'perf.m6';
      this.sortDesc = true;
    }
    this.page = 1;
  }

  perfYtd(f: Fund): number {
    return f.yearRoi[this.years.length - 1] ?? 0;
  }

  stableReturnRating(f: Fund): number {
    const positiveYears = f.yearRoi.filter(value => value > 0).length;
    return this.clampRating(Math.round((f.lipper + positiveYears) / 2));
  }

  capitalPreservationRating(f: Fund): number {
    const worstDrop = Math.max(...f.yearMaxDrop.map(value => Math.abs(value)));
    if (f.stdDev <= 6 && worstDrop <= 8) return 5;
    if (f.stdDev <= 10 && worstDrop <= 12) return 4;
    if (f.stdDev <= 15 && worstDrop <= 18) return 3;
    if (f.stdDev <= 22 && worstDrop <= 26) return 2;
    return 1;
  }

  esgScore(f: Fund): number {
    const seed = Array.from(f.fundId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Number((60 + (seed % 220) / 10).toFixed(1));
  }

  mobileSortSummaryLabel(): string {
    if (!this.shouldShowMobileSortSummary()) return '';
    const option = this.mobileSortOptions.find(opt => opt.key === this.sortKey);
    if (!option) return '';
    return option.label;
  }

  mobileSortSummaryValue(f: Fund): string {
    if (!this.shouldShowMobileSortSummary()) return '';
    return this.formatSortValue(f, this.sortKey);
  }

  mobileSortSummaryClass(f: Fund): string {
    if (!this.shouldShowMobileSortSummary()) return '';
    if (this.isRatingScoreKey(this.sortKey)) return this.ratingScoreClass(Number(this.fieldValue(f, this.sortKey)));
    if (!this.isSignedSortKey(this.sortKey)) return '';
    return this.numClass(Number(this.fieldValue(f, this.sortKey)));
  }

  private shouldShowMobileSortSummary(): boolean {
    if (!this.mobileSortOptions.some(opt => opt.key === this.sortKey)) return false;
    if (this.sortKey === 'fundId' || this.sortKey === 'name') return false;
    if (this.activeTab === 'perf') return !['perf.ytd', 'perf.m3', 'perf.m6'].includes(this.sortKey);
    if (this.activeTab === 'nav') return !['nav', 'navChange', 'navChangePct', 'navDate'].includes(this.sortKey);
    if (this.activeTab === 'roi') return !['roi.4', 'roi.3', 'roi.2'].includes(this.sortKey);
    if (this.activeTab === 'drop') return !['drop.4', 'drop.3', 'stdDev'].includes(this.sortKey);
    if (this.activeTab === 'rating') return false;
    return false;
  }

  private isSignedSortKey(key: SortKey): boolean {
    return key.startsWith('perf.')
      || key.startsWith('roi.')
      || key.startsWith('drop.')
      || key === 'navChange'
      || key === 'navChangePct';
  }

  private isRatingScoreKey(key: SortKey): boolean {
    return key === 'lipper' || key === 'stableReturn' || key === 'capitalPreservation';
  }

  private formatSortValue(f: Fund, key: SortKey): string {
    const value = this.fieldValue(f, key);
    if (key === 'currency' || key === 'navDate' || key === 'fundId' || key === 'name' || key === 'risk') {
      return String(value);
    }
    if (key === 'nav' || key === 'navChange') return this.fmtNav(Number(value));
    if (key === 'lipper' || key === 'stdDev' || key === 'stableReturn' || key === 'capitalPreservation') return String(value);
    if (key === 'esgScore') return Number(value).toFixed(1);
    return this.fmtPct(Number(value));
  }

  private clampRating(value: number): number {
    return Math.min(5, Math.max(1, value));
  }

  roiSortKey(index: number): SortKey {
    return `roi.${index}` as SortKey;
  }

  dropSortKey(index: number): SortKey {
    return `drop.${index}` as SortKey;
  }

  toggleDomicileFilter(value: DomicileOption): void {
    this.domicileFilters = this.toggleFilterValue(this.domicileFilters, value);
    this.onFilterChange();
  }

  toggleCategoryFilter(value: FundCategory): void {
    this.categoryFilters = this.toggleFilterValue(this.categoryFilters, value);
    this.onFilterChange();
  }

  togglePricingCcyFilter(value: PricingCcyOption): void {
    this.pricingCcyFilters = this.toggleFilterValue(this.pricingCcyFilters, value);
    this.onFilterChange();
  }

  toggleBrandFilter(value: string): void {
    this.brandFilters = this.toggleFilterValue(this.brandFilters, value);
    this.onFilterChange();
  }

  onBrandKeywordChange(): void {
    this.scheduleOverflowCheck();
  }

  toggleGroupFilter(value: string): void {
    this.groupFilters = this.toggleFilterValue(this.groupFilters, value);
    this.onFilterChange();
  }

  toggleRegionFilter(value: FundRegion): void {
    this.regionFilters = this.toggleFilterValue(this.regionFilters, value);
    this.onFilterChange();
  }

  toggleLipperFilter(value: number): void {
    this.lipperFilters = this.toggleFilterValue(this.lipperFilters, value);
    this.onFilterChange();
  }

  toggleRiskFilter(value: string): void {
    this.riskFilters = this.toggleFilterValue(this.riskFilters, value);
    this.onFilterChange();
  }

  clearFilterGroup(group: 'domicile' | 'category' | 'pricingCcy' | 'brand' | 'region' | 'group' | 'lipper' | 'risk'): void {
    if (group === 'domicile') this.domicileFilters = [];
    else if (group === 'category') this.categoryFilters = [];
    else if (group === 'pricingCcy') this.pricingCcyFilters = [];
    else if (group === 'brand') this.brandFilters = [];
    else if (group === 'region') this.regionFilters = [];
    else if (group === 'group') this.groupFilters = [];
    else if (group === 'lipper') this.lipperFilters = [];
    else this.riskFilters = [];
    this.onFilterChange();
  }

  clearFilters(): void {
    // 關鍵字搜尋與篩選脫鉤：清除篩選不動關鍵字（要清用搜尋框的 ⊗）
    this.brandKeyword = '';
    this.groupKeyword = '';
    this.filterPanelOpen = false;
    this.expandedFilters = {
      category: false,
      pricingCcy: false,
      brand: false,
      region: false,
      group: false,
      lipper: false,
      risk: false
    };
    this.domicileFilters = [];
    this.categoryFilters = [];
    this.pricingCcyFilters = [];
    this.brandFilters = [];
    this.regionFilters = [];
    this.groupFilters = [];
    this.lipperFilters = [];
    this.riskFilters = [];
    this.page = 1;
    this.scheduleOverflowCheck();
  }

  ngAfterViewInit(): void {
    this.observeChipAreas();
    this.chipAreaChangesSub = this.chipAreas?.changes.subscribe(() => this.observeChipAreas());
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounce);
    this.chipAreaChangesSub?.unsubscribe();
    this.disconnectChipObservers();
  }

  closeSortPanel(): void {
    this.sortPanelOpen = false;
  }

  openFilterPanel(): void {
    this.filterPanelOpen = true;
  }

  closeFilterPanel(): void {
    this.filterPanelOpen = false;
  }

  toggleFilterExpanded(group: CollapsibleFilter): void {
    this.expandedFilters[group] = !this.expandedFilters[group];
    if (group === 'brand' && !this.expandedFilters.brand) {
      this.brandKeyword = '';
    }
    if (group === 'group' && !this.expandedFilters.group) {
      this.groupKeyword = '';
    }
    this.scheduleOverflowCheck();
  }

  isFilterExpanded(group: CollapsibleFilter): boolean {
    return this.expandedFilters[group];
  }

  hasHiddenOptions(group: CollapsibleFilter): boolean {
    return this.overflowState[group];
  }

  onFilterChange(): void {
    this.page = 1;
    this.scheduleOverflowCheck();
  }

  // 打字：debounce 後更新建議下拉（模擬正式區後端 typeahead）；主結果列不即時篩
  onKeywordInput(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.refreshSearchMatches(), 300);
  }

  onSearchFocus(): void {
    this.searchFocused = true;
    this.refreshSearchMatches();
  }

  onSearchBlur(): void {
    // 延遲收起，讓下拉項目的點選先觸發
    setTimeout(() => this.searchFocused = false, 150);
  }

  selectSearchFund(fund: Fund): void {
    clearTimeout(this.searchDebounce);
    this.keyword = fund.name;
    this.appliedKeyword = fund.name;
    this.searchFocused = false;
    this.page = 1;
    this.scheduleOverflowCheck();
  }

  // 明確搜尋：把目前關鍵字套用到主結果列（正式區才打後端，避免每按鍵查詢）
  applyKeywordSearch(): void {
    clearTimeout(this.searchDebounce);
    this.appliedKeyword = this.keyword.trim();
    this.searchFocused = false;
    this.page = 1;
    this.scheduleOverflowCheck();
  }

  clearKeyword(): void {
    clearTimeout(this.searchDebounce);
    this.keyword = '';
    this.appliedKeyword = '';
    this.searchMatches = [];
    this.page = 1;
    this.scheduleOverflowCheck();
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.page = 1;
  }

  isCardExpanded(id: string): boolean {
    return this.expandedCards.has(id);
  }

  toggleCard(id: string): void {
    this.expandedCards.has(id) ? this.expandedCards.delete(id) : this.expandedCards.add(id);
  }

  setViewMode(mode: 'card' | 'table'): void {
    this.viewMode = mode;
  }

  onBuy(fund: Fund): void {
    this.router.navigate(['/demo/flow'], {
      queryParams: { mode: 'new', fundId: fund.fundId }
    });
  }

  // 百分比：千分位、最多 2 位小數、不補零（依平台通規 §4.4）
  fmtPct(n: number): string {
    return `${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
  }

  // 淨值：千分位、最多 4 位小數、不補零（依平台通規 §4.4；位數依各基金公司浮動，不寫死）
  fmtNav(n: number): string {
    return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 4 });
  }

  numClass(n: number): string {
    return n > 0 ? 'val-up' : n < 0 ? 'val-down' : '';
  }

  ratingScoreClass(score: number): string {
    return score === 5 ? 'rating-score-max' : '';
  }

  sortIconClass(key: SortKey): string {
    return this.sortKey === key && !this.sortDesc ? 'bi-caret-up-fill' : 'bi-caret-down-fill';
  }

  isSortActive(key: SortKey): boolean {
    return this.sortKey === key;
  }

  trackByFundId(_: number, f: Fund): string {
    return f.fundId;
  }

  trackBySortKey(_: number, option: SortOption): SortKey {
    return option.key;
  }

  trackByValue(_: number, value: string): string {
    return value;
  }

  private toggleFilterValue<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
  }

  private observeChipAreas(): void {
    this.disconnectChipObservers();
    this.chipAreas?.forEach(ref => {
      const observer = new ResizeObserver(() => this.scheduleOverflowCheck());
      observer.observe(ref.nativeElement);
      this.chipObservers.push(observer);
    });
    this.scheduleOverflowCheck();
  }

  private disconnectChipObservers(): void {
    this.chipObservers.forEach(observer => observer.disconnect());
    this.chipObservers = [];
  }

  private scheduleOverflowCheck(): void {
    setTimeout(() => this.detectAllOverflow());
  }

  // 以「首尾 chip 是否在同一行」判斷該列放不放得下，比估算字寬可靠
  private detectAllOverflow(): void {
    let changed = false;
    this.chipAreas?.forEach(ref => {
      const el = ref.nativeElement;
      if (el.offsetParent === null) return; // 隱藏的實例（如未開的手機面板）跳過
      const group = el.dataset['filterGroup'] as CollapsibleFilter | undefined;
      if (!group) return;
      const next = this.isChipWrapped(el);
      if (this.overflowState[group] !== next) {
        this.overflowState[group] = next;
        changed = true;
      }
    });
    if (changed) this.cdr.detectChanges();
  }

  private isChipWrapped(container: HTMLElement): boolean {
    const chips = container.querySelectorAll<HTMLElement>('.chip');
    if (chips.length < 2) return false;
    return chips[chips.length - 1].offsetTop > chips[0].offsetTop;
  }
}
