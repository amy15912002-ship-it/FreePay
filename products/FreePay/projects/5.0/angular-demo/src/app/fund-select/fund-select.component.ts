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
  FUND_CATEGORIES, FUND_REGIONS, FUND_BRANDS, FUND_PRICING_CCY, FUND_GROUPS, LIPPER_RATINGS,
} from '../mock-data/funds';

type DomicileOption = Fund['domicile'];
type PricingCcyOption = string;
type FundTab = 'perf' | 'roi' | 'drop' | 'nav';
type CollapsibleFilter = 'category' | 'pricingCcy' | 'brand' | 'region' | 'group' | 'lipper';

type SortKey =
  | 'fundId' | 'name'
  | 'perf.m3' | 'perf.m6' | 'perf.y1' | 'perf.y2' | 'perf.y3' | 'perf.y5' | 'stdDev'
  | 'roi.0' | 'roi.1' | 'roi.2' | 'roi.3' | 'roi.4'
  | 'drop.0' | 'drop.1' | 'drop.2' | 'drop.3' | 'drop.4'
  | 'navDate' | 'nav' | 'navChange' | 'navChangePct' | 'currency';
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
  readonly domiciles: DomicileOption[] = ['境內', '境外'];
  readonly years = [2021, 2022, 2023, 2024, 2025];
  pageSize = 20;
  readonly pageSizeOptions = [20, 50, 100];
  readonly perfSortOptions: SortOption[] = [
    { key: 'perf.m3', label: '3個月' },
    { key: 'perf.m6', label: '6個月' },
    { key: 'perf.y1', label: '1年' },
    { key: 'perf.y2', label: '2年' },
    { key: 'perf.y3', label: '3年' },
    { key: 'perf.y5', label: '5年' },
    { key: 'stdDev', label: '標準差' },
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
    { key: 'drop.4', label: '2025' }
  ];
  readonly navSortOptions: SortOption[] = [
    { key: 'navChangePct', label: '日漲跌幅' },
    { key: 'navChange', label: '日漲跌' },
    { key: 'nav', label: '淨值' },
    { key: 'navDate', label: '日期' },
    { key: 'currency', label: '幣別' }
  ];

  get pricingCurrencies(): PricingCcyOption[] {
    return FUND_PRICING_CCY;
  }

  keyword = '';
  searchFocused = false;
  brandKeyword = '';
  brandSearchOpen = false;
  groupKeyword = '';
  groupSearchOpen = false;
  expandedFilters: Record<CollapsibleFilter, boolean> = {
    category: false,
    pricingCcy: false,
    brand: false,
    region: false,
    group: false,
    lipper: false
  };
  domicileFilters: DomicileOption[] = [];
  categoryFilters: FundCategory[] = [];
  pricingCcyFilters: PricingCcyOption[] = [];
  brandFilters: string[] = [];
  regionFilters: FundRegion[] = [];
  groupFilters: string[] = [];
  lipperFilters: number[] = [];

  activeTab: FundTab = 'perf';
  sortKey: SortKey = 'perf.m6';
  sortDesc = true;
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
    lipper: false
  };

  private chipObservers: ResizeObserver[] = [];
  private chipAreaChangesSub?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get filteredFunds(): Fund[] {
    const kw = this.keyword.trim().toLowerCase();
    return this.funds.filter(f => {
      if (kw && !f.fundId.toLowerCase().includes(kw) && !f.name.toLowerCase().includes(kw)) return false;
      if (this.domicileFilters.length && !this.domicileFilters.includes(f.domicile)) return false;
      if (this.categoryFilters.length && !this.categoryFilters.includes(f.category)) return false;
      if (this.pricingCcyFilters.length && !this.pricingCcyFilters.includes(f.pricingCurrency as PricingCcyOption)) return false;
      if (this.brandFilters.length && !this.brandFilters.includes(f.brand)) return false;
      if (this.regionFilters.length && !this.regionFilters.includes(f.region)) return false;
      if (this.groupFilters.length && !this.groupFilters.includes(f.group)) return false;
      if (this.lipperFilters.length && !this.lipperFilters.includes(f.lipper)) return false;
      return true;
    });
  }

  // 基金搜尋即時下拉：匹配代碼或名稱，開頭匹配優先、組內按名稱排序，上限 20 筆
  get searchMatches(): Fund[] {
    const kw = this.keyword.trim().toLowerCase();
    if (!kw) return [];
    const startsWith = (f: Fund) =>
      f.fundId.toLowerCase().startsWith(kw) || f.name.toLowerCase().startsWith(kw);
    return this.funds
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
    return this.navSortOptions;
  }

  get activeFilterCount(): number {
    return [
      this.keyword.trim(),
      ...this.domicileFilters,
      ...this.categoryFilters,
      ...this.pricingCcyFilters,
      ...this.brandFilters,
      ...this.regionFilters,
      ...this.groupFilters,
      ...this.lipperFilters
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
    if (key.startsWith('perf.')) return f.perf[key.split('.')[1] as PerfKey];
    if (key === 'stdDev') return f.stdDev;
    if (key.startsWith('roi.')) return f.yearRoi[Number(key.split('.')[1])];
    if (key.startsWith('drop.')) return f.yearMaxDrop[Number(key.split('.')[1])];
    if (key === 'nav') return f.nav;
    if (key === 'navChange') return f.navChange;
    if (key === 'navChangePct') return f.navChangePct;
    if (key === 'navDate') return f.navDate;
    if (key === 'currency') return f.pricingCurrency;
    return 0;
  }

  setSort(key: SortKey): void {
    if (this.sortKey === key) this.sortDesc = !this.sortDesc;
    else { this.sortKey = key; this.sortDesc = true; }
    this.page = 1;
  }

  toggleSortDirection(): void {
    this.sortDesc = !this.sortDesc;
    this.page = 1;
  }

  setTab(tab: FundTab): void {
    this.activeTab = tab;
    if (tab === 'perf') this.sortKey = 'perf.m6';
    else if (tab === 'roi') this.sortKey = 'roi.4';     // 預設依最新一年排序
    else if (tab === 'drop') this.sortKey = 'drop.4';
    else this.sortKey = 'navChangePct';                 // 最新淨值：預設依日漲跌幅排序
    this.sortDesc = true;
    this.page = 1;
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

  onGroupKeywordChange(): void {
    this.scheduleOverflowCheck();
  }

  toggleRegionFilter(value: FundRegion): void {
    this.regionFilters = this.toggleFilterValue(this.regionFilters, value);
    this.onFilterChange();
  }

  toggleLipperFilter(value: number): void {
    this.lipperFilters = this.toggleFilterValue(this.lipperFilters, value);
    this.onFilterChange();
  }

  clearFilterGroup(group: 'domicile' | 'category' | 'pricingCcy' | 'brand' | 'region' | 'group' | 'lipper'): void {
    if (group === 'domicile') this.domicileFilters = [];
    else if (group === 'category') this.categoryFilters = [];
    else if (group === 'pricingCcy') this.pricingCcyFilters = [];
    else if (group === 'brand') this.brandFilters = [];
    else if (group === 'region') this.regionFilters = [];
    else if (group === 'group') this.groupFilters = [];
    else this.lipperFilters = [];
    this.onFilterChange();
  }

  clearFilters(): void {
    this.keyword = '';
    this.brandKeyword = '';
    this.brandSearchOpen = false;
    this.groupKeyword = '';
    this.groupSearchOpen = false;
    this.filterPanelOpen = false;
    this.expandedFilters = {
      category: false,
      pricingCcy: false,
      brand: false,
      region: false,
      group: false,
      lipper: false
    };
    this.domicileFilters = [];
    this.categoryFilters = [];
    this.pricingCcyFilters = [];
    this.brandFilters = [];
    this.regionFilters = [];
    this.groupFilters = [];
    this.lipperFilters = [];
    this.page = 1;
    this.scheduleOverflowCheck();
  }

  ngAfterViewInit(): void {
    this.observeChipAreas();
    this.chipAreaChangesSub = this.chipAreas?.changes.subscribe(() => this.observeChipAreas());
  }

  ngOnDestroy(): void {
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
      this.brandSearchOpen = false;
      this.brandKeyword = '';
    }
    if (group === 'group' && !this.expandedFilters.group) {
      this.groupSearchOpen = false;
      this.groupKeyword = '';
    }
    this.scheduleOverflowCheck();
  }

  toggleBrandSearch(): void {
    this.brandSearchOpen = !this.brandSearchOpen;
    if (!this.brandSearchOpen) {
      this.brandKeyword = '';
    }
    this.scheduleOverflowCheck();
  }

  toggleGroupSearch(): void {
    this.groupSearchOpen = !this.groupSearchOpen;
    if (!this.groupSearchOpen) {
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

  onSearchFocus(): void {
    this.searchFocused = true;
  }

  onSearchBlur(): void {
    // 延遲收起，讓下拉項目的點選先觸發
    setTimeout(() => this.searchFocused = false, 150);
  }

  selectSearchFund(fund: Fund): void {
    this.keyword = fund.name;
    this.searchFocused = false;
    this.onFilterChange();
  }

  // 以目前關鍵字搜尋全部（不指定單一基金）：收起下拉，表格保留關鍵字篩選（可顯示多檔）
  applyKeywordSearch(): void {
    this.searchFocused = false;
    this.onFilterChange();
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
    const chips = container.querySelectorAll<HTMLElement>('.mat-chip');
    if (chips.length < 2) return false;
    return chips[chips.length - 1].offsetTop > chips[0].offsetTop;
  }
}
