import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FUNDS, Fund, FundCategory, FundRegion,
  FUND_CATEGORIES, FUND_REGIONS, FUND_BRANDS,
  pricingCurrenciesByDomiciles,
} from '../mock-data/funds';

type DomicileOption = Fund['domicile'];
type PricingCcyOption = string;
type FundTab = 'perf' | 'roi' | 'drop';
type CollapsibleFilter = 'brand';

type SortKey =
  | 'fundId' | 'name'
  | 'perf.m6' | 'perf.y1' | 'perf.y2' | 'perf.y3' | 'perf.y5' | 'stdDev'
  | 'roi.0' | 'roi.1' | 'roi.2' | 'roi.3' | 'roi.4'
  | 'drop.0' | 'drop.1' | 'drop.2' | 'drop.3' | 'drop.4';
type PerfKey = keyof Fund['perf'];
type SortOption = { key: SortKey; label: string };

@Component({
  selector: 'fp-fund-select',
  templateUrl: './fund-select.component.html',
  styleUrls: ['./fund-select.component.scss'],
})
export class FundSelectComponent {
  readonly funds = FUNDS;
  readonly categories = FUND_CATEGORIES;
  readonly regions = FUND_REGIONS;
  readonly brands = FUND_BRANDS;
  readonly domiciles: DomicileOption[] = ['境內', '境外'];
  readonly years = [2021, 2022, 2023, 2024, 2025];
  readonly pageSize = 10;
  readonly perfSortOptions: SortOption[] = [
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

  // 計價幣別選項依「境別篩選的當前狀態」動態切換（spec 升級三 §基金選擇頁）
  // 境內：台幣/美元；境外：台幣/美元/日幣/歐元/南非幣/人民幣；境別「全部」：合併呈現
  get pricingCurrencies(): PricingCcyOption[] {
    return pricingCurrenciesByDomiciles(this.domicileFilters);
  }

  keyword = '';
  brandKeyword = '';
  brandSearchOpen = false;
  expandedFilters: Record<CollapsibleFilter, boolean> = {
    brand: false
  };
  domicileFilters: DomicileOption[] = [];
  categoryFilters: FundCategory[] = [];
  pricingCcyFilters: PricingCcyOption[] = [];
  brandFilters: string[] = [];
  regionFilters: FundRegion[] = [];

  activeTab: FundTab = 'perf';
  sortKey: SortKey = 'perf.m6';
  sortDesc = true;
  page = 1;
  sortPanelOpen = false;

  constructor(private readonly router: Router) {}

  get filteredFunds(): Fund[] {
    const kw = this.keyword.trim().toLowerCase();
    return this.funds.filter(f => {
      if (kw && !f.fundId.toLowerCase().includes(kw) && !f.name.toLowerCase().includes(kw)) return false;
      if (this.domicileFilters.length && !this.domicileFilters.includes(f.domicile)) return false;
      if (this.categoryFilters.length && !this.categoryFilters.includes(f.category)) return false;
      if (this.pricingCcyFilters.length && !this.pricingCcyFilters.includes(f.pricingCurrency as PricingCcyOption)) return false;
      if (this.brandFilters.length && !this.brandFilters.includes(f.brand)) return false;
      if (this.regionFilters.length && !this.regionFilters.includes(f.region)) return false;
      return true;
    });
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
    return this.dropSortOptions;
  }

  get filteredBrands(): string[] {
    const kw = this.brandKeyword.trim().toLowerCase();
    if (!kw) return this.brands;
    return this.brands.filter(brand => brand.toLowerCase().includes(kw));
  }

  get visibleCategories(): FundCategory[] {
    return this.categories;
  }

  get visiblePricingCurrencies(): PricingCcyOption[] {
    return this.pricingCurrencies;
  }

  get visibleBrands(): string[] {
    return this.visibleOptions(this.filteredBrands, this.brandFilters, this.expandedFilters.brand || this.brandKeyword.trim() !== '', 10);
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
    else this.sortKey = 'drop.4';
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
    // 切換境別後，可選的計價幣別範圍會改變；已選但已不在新範圍內的幣別自動移除
    const allowed = this.pricingCurrencies;
    this.pricingCcyFilters = this.pricingCcyFilters.filter(c => allowed.includes(c));
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

  toggleRegionFilter(value: FundRegion): void {
    this.regionFilters = this.toggleFilterValue(this.regionFilters, value);
    this.onFilterChange();
  }

  clearFilterGroup(group: 'domicile' | 'category' | 'pricingCcy' | 'brand' | 'region'): void {
    if (group === 'domicile') this.domicileFilters = [];
    else if (group === 'category') this.categoryFilters = [];
    else if (group === 'pricingCcy') this.pricingCcyFilters = [];
    else if (group === 'brand') this.brandFilters = [];
    else this.regionFilters = [];
    this.onFilterChange();
  }

  clearFilters(): void {
    this.keyword = '';
    this.brandKeyword = '';
    this.brandSearchOpen = false;
    this.expandedFilters = {
      brand: false
    };
    this.domicileFilters = [];
    this.categoryFilters = [];
    this.pricingCcyFilters = [];
    this.brandFilters = [];
    this.regionFilters = [];
    this.page = 1;
  }

  closeSortPanel(): void {
    this.sortPanelOpen = false;
  }

  toggleFilterExpanded(group: CollapsibleFilter): void {
    this.expandedFilters[group] = !this.expandedFilters[group];
  }

  isFilterExpanded(group: CollapsibleFilter): boolean {
    return this.expandedFilters[group];
  }

  hasHiddenOptions(group: CollapsibleFilter): boolean {
    return group === 'brand' && this.filteredBrands.length > this.visibleBrands.length;
  }

  onFilterChange(): void {
    this.page = 1;
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  onBuy(fund: Fund): void {
    this.router.navigate(['/demo/flow'], {
      queryParams: { mode: 'new', fundId: fund.fundId }
    });
  }

  fmtPct(n: number): string {
    return `${n < 0 ? '-' : ''}${Math.abs(n).toFixed(2)}%`;
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

  private visibleOptions<T extends string>(options: T[], selected: T[], expanded: boolean, limit: number): T[] {
    if (expanded || options.length <= limit) return options;
    const visible = options.slice(0, limit);
    for (const value of selected) {
      if (options.includes(value) && !visible.includes(value)) visible.push(value);
    }
    return visible;
  }

  private toggleFilterValue<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
  }
}
