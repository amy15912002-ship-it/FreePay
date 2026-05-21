import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FUNDS, Fund, FundCategory, FundRegion,
  FUND_CATEGORIES, FUND_REGIONS, FUND_BRANDS,
} from '../mock-data/funds';

type DomicileOption = Fund['domicile'];
type PricingCcyOption = '台幣' | '美元' | '日幣';
type FundTab = 'perf' | 'roi' | 'drop';

type SortKey =
  | 'fundId' | 'name'
  | 'perf.m6' | 'perf.y1' | 'perf.y2' | 'perf.y3' | 'perf.y5' | 'stdDev'
  | 'roi.0' | 'roi.1' | 'roi.2' | 'roi.3' | 'roi.4'
  | 'drop.0' | 'drop.1' | 'drop.2' | 'drop.3' | 'drop.4';
type PerfKey = keyof Fund['perf'];

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
  readonly pricingCurrencies: PricingCcyOption[] = ['台幣', '美元', '日幣'];
  readonly years = [2021, 2022, 2023, 2024, 2025];
  readonly pageSize = 10;

  keyword = '';
  domicileFilters: DomicileOption[] = [];
  categoryFilters: FundCategory[] = [];
  pricingCcyFilters: PricingCcyOption[] = [];
  brandFilters: string[] = [];
  regionFilters: FundRegion[] = [];

  activeTab: FundTab = 'perf';
  sortKey: SortKey = 'perf.m6';
  sortDesc = true;
  page = 1;

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
    this.domicileFilters = [];
    this.categoryFilters = [];
    this.pricingCcyFilters = [];
    this.brandFilters = [];
    this.regionFilters = [];
    this.page = 1;
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
    return this.sortKey === key && !this.sortDesc ? 'bi-chevron-up' : 'bi-chevron-down';
  }

  isSortActive(key: SortKey): boolean {
    return this.sortKey === key;
  }

  trackByFundId(_: number, f: Fund): string {
    return f.fundId;
  }

  private toggleFilterValue<T>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
  }
}
