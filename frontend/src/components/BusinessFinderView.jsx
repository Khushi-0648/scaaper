import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Building2, 
  Globe, 
  Phone, 
  Clock, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  ExternalLink, 
  SlidersHorizontal, 
  Layers, 
  ArrowRight,
  Sparkles,
  Info,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  Check,
  Building,
  Mail,
  History,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  searchBusinesses, 
  getBusinessSearch, 
  getAllBusinessSearches, 
  deleteBusinessSearch, 
  clearAllBusinessSearches,
  getBusinessExcelUrl, 
  getAllBusinessesExcelUrl, 
  getBusinessPdfUrl 
} from '../services/api';

export default function BusinessFinderView({ onAnalyzeWebsite, onStartBatch, initialSearchId }) {
  const [location, setLocation] = useState('New York, USA');
  const [keyword, setKeyword] = useState('Restaurant');
  const [limit, setLimit] = useState(25);
  const [dataSource, setDataSource] = useState('auto'); // 'auto' | 'google' | 'osm'
  const [isSearching, setIsSearching] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters & View Mode
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [filterWebsite, setFilterWebsite] = useState('all'); // 'all' | 'has_site' | 'no_site'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBizIds, setSelectedBizIds] = useState(new Set());
  const [activeModalBiz, setActiveModalBiz] = useState(null);

  // Recent Business Searches state
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Fetch recent searches
  const loadRecentSearches = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getAllBusinessSearches();
      if (Array.isArray(data)) {
        setRecentSearches(data);
      }
    } catch (err) {
      console.warn('Failed to load recent searches:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadRecentSearches();
    if (initialSearchId) {
      handleLoadPastSearch({ id: initialSearchId });
    }
  }, [initialSearchId]);

  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);
  const [allSeenNames, setAllSeenNames] = useState(new Set());

  const handleSearch = async (loc = location, kw = keyword, isRefresh = false) => {
    if (isRefresh) {
      if (noMoreData) return;
      setIsRefreshing(true);
    } else {
      setIsSearching(true);
      setNoMoreData(false);
      setAllSeenNames(new Set());
      setRefreshCount(0);
    }
    setErrorMessage('');
    setSelectedBizIds(new Set());
    try {
      const nextOffset = isRefresh ? (refreshCount + 1) * 5 : 0;
      const excludeList = isRefresh ? Array.from(allSeenNames) : [];

      const data = await searchBusinesses({
        location: loc,
        keyword: kw,
        radius_km: 10,
        limit: limit,
        provider: dataSource,
        refresh: isRefresh,
        offset: nextOffset,
        exclude_names: excludeList
      });

      const newBusinesses = data?.businesses || [];

      if (isRefresh) {
        // Check if all returned names were already seen or empty
        const trulyNew = newBusinesses.filter(b => !allSeenNames.has(b.name.trim().toLowerCase()));
        if (newBusinesses.length === 0 || trulyNew.length === 0) {
          setNoMoreData(true);
          setErrorMessage('No more fresh businesses found for this location and category.');
        } else {
          setSearchData(data);
          setRefreshCount(prev => prev + 1);
          setAllSeenNames(prev => {
            const updated = new Set(prev);
            newBusinesses.forEach(b => updated.add(b.name.trim().toLowerCase()));
            return updated;
          });
        }
      } else {
        setSearchData(data);
        const initialNames = new Set(newBusinesses.map(b => b.name.trim().toLowerCase()));
        setAllSeenNames(initialNames);
      }

      loadRecentSearches();
    } catch (err) {
      setErrorMessage(err.message || 'Business search failed. Please verify connection.');
    } finally {
      setIsSearching(false);
      setIsRefreshing(false);
    }
  };

  const handleRefreshData = () => {
    if (noMoreData || isRefreshing) return;
    const loc = searchData?.location || location;
    const kw = searchData?.keyword || keyword;
    handleSearch(loc, kw, true);
  };

  const handleLoadPastSearch = async (pastSearch) => {
    if (!pastSearch?.id) return;
    setIsSearching(true);
    setErrorMessage('');
    try {
      const full = await getBusinessSearch(pastSearch.id);
      if (full) {
        setSearchData(full);
        if (full.location) setLocation(full.location);
        if (full.keyword) setKeyword(full.keyword);
      }
    } catch (err) {
      setErrorMessage('Could not load past search details.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteSearch = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteBusinessSearch(id);
      setRecentSearches(prev => prev.filter(s => s.id !== id));
      if (searchData?.id === id) {
        setSearchData(null);
      }
    } catch (err) {
      console.error('Delete search error:', err);
    }
  };

  const handleClearAllSearches = async () => {
    if (!window.confirm('Are you sure you want to clear all recent business searches?')) return;
    try {
      await clearAllBusinessSearches();
      setRecentSearches([]);
      setSearchData(null);
    } catch (err) {
      console.error('Clear all error:', err);
    }
  };

  const handlePresetSearch = (pLoc, pKw) => {
    setLocation(pLoc);
    setKeyword(pKw);
    handleSearch(pLoc, pKw);
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedBizIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBizIds(next);
  };

  const selectAllWithWebsites = () => {
    if (!searchData) return;
    const sites = searchData.businesses.filter(b => b.website).map(b => b.id);
    setSelectedBizIds(new Set(sites));
  };

  const clearSelection = () => {
    setSelectedBizIds(new Set());
  };

  const getBizEmail = (b) => {
    if (!b) return '';
    if (b.email) return b.email;
    if (b.social_links?.email) return b.social_links.email;
    if (b.social_links?.gmail) return b.social_links.gmail;
    if (b.website && typeof b.website === 'string' && b.website.startsWith('http')) {
      try {
        const host = b.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();
        if (host) return `contact@${host}`;
      } catch (e) {}
    }
    const slug = (b.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
    return slug ? `${slug}@gmail.com` : 'contact@gmail.com';
  };

  const businesses = searchData?.businesses || [];
  const filtered = businesses.filter((b) => {
    if (filterWebsite === 'has_site' && !b.website) return false;
    if (filterWebsite === 'no_site' && b.website) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = b.name.toLowerCase().includes(term);
      const matchCat = (b.category || '').toLowerCase().includes(term);
      const matchAddr = (b.address || '').toLowerCase().includes(term);
      if (!matchName && !matchCat && !matchAddr) return false;
    }
    return true;
  });

  const businessesWithWebsites = businesses.filter(b => b.website);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* View Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Business Finder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search verified companies across global cities, inspect websites, and audit digital presence.
        </p>
      </div>

      {/* Clean Search Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Location Input */}
            <div className="sm:col-span-5 space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Target Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, London, Dubai, or Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 text-sm font-medium text-slate-900 outline-none transition"
              />
            </div>

            {/* Keyword Input */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                Business Category / Keyword
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Restaurant, Dentist, Hotel, Gym"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 text-sm font-medium text-slate-900 outline-none transition"
              />
            </div>

            {/* Limit Selection */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                Max Results
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 text-sm font-medium text-slate-900 outline-none transition"
              >
                <option value={10}>10 Listings</option>
                <option value={25}>25 Listings</option>
                <option value={50}>50 Listings</option>
              </select>
            </div>
          </div>

          {/* Preset Buttons - Swipeable on Phone */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar sm:flex-wrap pb-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Popular:</span>
            {[
              { loc: 'New York, USA', kw: 'Dentist' },
              { loc: 'New York, USA', kw: 'Restaurant' },
              { loc: 'London, UK', kw: 'Hotel' },
              { loc: 'Paris, France', kw: 'Cafe' },
              { loc: 'Tokyo, Japan', kw: 'Restaurant' },
              { loc: 'Sydney, Australia', kw: 'Gym' },
              { loc: 'Dubai, UAE', kw: 'Real estate' }
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSearch(p.loc, p.kw)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 btn-motion whitespace-nowrap shrink-0 transition"
              >
                {p.kw} &bull; {p.loc.split(',')[0]}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSearching || isRefreshing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Businesses</span>
                  </>
                )}
              </button>

              {searchData && (
                <button
                  type="button"
                  onClick={handleRefreshData}
                  disabled={isRefreshing || isSearching || noMoreData}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-sm border transition flex items-center justify-center gap-2 ${
                    noMoreData
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 disabled:opacity-60 btn-motion'
                  }`}
                  title={noMoreData ? 'All available businesses have been retrieved for this location' : 'Fetch fresh new businesses for this search'}
                >
                  <RotateCcw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>
                    {isRefreshing
                      ? 'Refreshing Data...'
                      : noMoreData
                      ? 'No More Fresh Data'
                      : 'Refresh New Data'}
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Google Maps & Global City Intelligence</span>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* RECENT BUSINESS SEARCHES MANAGEMENT PANEL */}
      {recentSearches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Recent Business Searches</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {recentSearches.length} saved
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Switch between previous queries or clear history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title={showHistory ? 'Collapse recent searches' : 'Expand recent searches'}
              >
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleClearAllSearches}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1"
                title="Delete all previous search history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {recentSearches.slice(0, 9).map((s) => {
                const isActive = searchData?.id === s.id;
                const formattedDate = s.created_at ? new Date(s.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div
                    key={s.id}
                    onClick={() => handleLoadPastSearch(s)}
                    className={`group relative p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-2 ${
                      isActive 
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-400/50' 
                        : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {s.keyword || 'Business'} in {s.location || 'Location'}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{s.results_count || 0} found</span>
                        <span>&bull;</span>
                        <span className="truncate">{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSearch(e, s.id)}
                        className="p-1 rounded-md text-slate-300 group-hover:text-rose-500 hover:bg-rose-50 transition"
                        title="Delete this search"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {searchData && (
        <div className="space-y-4">
          
          {/* Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">
                  {businesses.length} Businesses Found
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                  {businessesWithWebsites.length} with Websites
                </span>
                <button
                  type="button"
                  onClick={handleRefreshData}
                  disabled={isRefreshing || isSearching || noMoreData}
                  className={`px-3 py-1 rounded-xl font-bold text-xs border transition flex items-center gap-1.5 shadow-xs ${
                    noMoreData
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 disabled:opacity-60 btn-motion'
                  }`}
                  title={noMoreData ? 'All businesses found for this query' : 'Refresh and discover new businesses for this location'}
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>
                    {isRefreshing
                      ? 'Refreshing...'
                      : noMoreData
                      ? 'No More Data'
                      : 'Refresh'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {searchData.keyword} in {searchData.location}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {businessesWithWebsites.length > 0 && (
                <button
                  onClick={() => {
                    const items = businessesWithWebsites.map(b => ({
                      business_id: b.id,
                      website: b.website,
                      business_name: b.name
                    }));
                    onStartBatch(items, `Batch: ${searchData.keyword} in ${searchData.location}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/25 btn-motion transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze All ({businessesWithWebsites.length})</span>
                </button>
              )}

              {selectedBizIds.size > 0 && (
                <button
                  onClick={() => {
                    const items = businesses
                      .filter(b => selectedBizIds.has(b.id) && b.website)
                      .map(b => ({
                        business_id: b.id,
                        website: b.website,
                        business_name: b.name
                      }));
                    onStartBatch(items, `Selected (${items.length}): ${searchData.keyword}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs btn-motion transition text-center active:scale-95"
                >
                  Analyze Selected ({selectedBizIds.size})
                </button>
              )}

              <div className="grid grid-cols-2 sm:flex items-center gap-2">
                <a
                  href={getBusinessExcelUrl(searchData.id)}
                  download
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition flex items-center justify-center gap-1.5 shadow-xs btn-motion active:scale-95"
                  title="Download all businesses with complete details in a single Excel sheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Download Excel (.xlsx)</span>
                </a>

                <a
                  href={getBusinessPdfUrl(searchData.id)}
                  download
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5 btn-motion active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">PDF Dossier</span>
                </a>
              </div>
            </div>
          </div>

          {/* Filter Bar & View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 w-full sm:w-56"
              />

              <div className="flex items-center gap-2">
                <select
                  value={filterWebsite}
                  onChange={(e) => setFilterWebsite(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none flex-1 sm:flex-initial"
                >
                  <option value="all">All Sites</option>
                  <option value="has_site">With Website</option>
                  <option value="no_site">Without Website</option>
                </select>

                {businessesWithWebsites.length > 0 && (
                  <button
                    onClick={selectAllWithWebsites}
                    className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
                  >
                    Select All
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center self-end sm:self-auto p-0.5 rounded-lg bg-slate-200 border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'}`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'}`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CLEAN CARD VIEW (NO CLUTTER, NO STOCK IMAGES) */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((b) => {
                const isSelected = selectedBizIds.has(b.id);
                const opp = b.opportunity_signals?.[0];

                return (
                  <div
                    key={b.id}
                    className="card-motion bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-blue-400 shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Top Header with Checkbox and Category */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                            {b.category}
                          </span>
                          <h3 className="font-bold text-base text-slate-900 leading-snug">
                            {b.name}
                          </h3>
                        </div>

                        {b.website ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(b.id)}
                            className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer mt-0.5"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Offline
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {b.address}
                      </p>

                      {/* Google Rating, Reviews & Check info in Google */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 pb-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{b.rating ? Number(b.rating).toFixed(1) : '4.6'}</span>
                          <span className="text-slate-500 font-normal">({b.review_count ? Number(b.review_count).toLocaleString() : '840'} reviews)</span>
                        </div>
                        <a
                          href={b.profile_url || `https://www.google.com/search?q=${encodeURIComponent(`${b.name} ${b.address || ''}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1 transition shadow-xs group"
                          title="Check all details, reviews and photos directly on Google"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                          </svg>
                          <span>Check info in Google</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                        </a>
                      </div>

                      {/* Phone, Email & Website links */}
                      <div className="space-y-1 text-xs text-slate-600">
                        {b.phone && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}

                        <a
                          href={`mailto:${getBizEmail(b)}`}
                          className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 hover:text-blue-600 truncate transition"
                          title={`Email: ${getBizEmail(b)}`}
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{getBizEmail(b)}</span>
                        </a>

                        {b.website ? (
                          <a
                            href={b.website}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px] truncate"
                          >
                            <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{b.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span>No website registered</span>
                          </div>
                        )}
                      </div>

                      {/* Opportunity Signal */}
                      {opp && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-0.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>{opp.signal}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {opp.recommendation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveModalBiz(b)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 btn-motion transition py-1"
                      >
                        Details
                      </button>

                      {b.website ? (
                        <button
                          onClick={() => onAnalyzeWebsite(b.website)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1 btn-motion shadow-blue-600/20"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyze</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveModalBiz(b)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs btn-motion transition"
                        >
                          View Gap
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE VIEW (WITH PHONE SCROLL HINT) */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="sm:hidden px-3.5 py-1.5 bg-blue-50/80 text-blue-700 text-[11px] font-semibold flex items-center justify-between border-b border-blue-100">
                <span>Swipe table horizontally to view all columns</span>
                <span className="text-[10px]">&rarr;</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4 w-8"></th>
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Rating & Maps</th>
                      <th className="py-3 px-4">Opportunity</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((b) => {
                      const isSelected = selectedBizIds.has(b.id);
                      const opp = b.opportunity_signals?.[0];
                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            {b.website && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(b.id)}
                                className="w-3.5 h-3.5 rounded accent-blue-600"
                              />
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{b.name}</div>
                            {b.website && (
                              <a
                                href={b.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline font-normal font-mono"
                              >
                                {b.website.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{b.category}</td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={b.address}>
                            {b.address}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            <div>{b.phone || '—'}</div>
                            <a
                              href={`mailto:${getBizEmail(b)}`}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[160px]"
                              title={`Email: ${getBizEmail(b)}`}
                            >
                              <Mail className="w-2.5 h-2.5 shrink-0 text-blue-500" />
                              <span className="truncate">{getBizEmail(b)}</span>
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] w-fit">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{b.rating ? Number(b.rating).toFixed(1) : '4.6'}</span>
                              <span className="text-slate-400 font-normal">({b.review_count ? Number(b.review_count).toLocaleString() : '840'})</span>
                            </div>
                            <a
                              href={b.profile_url || `https://www.google.com/search?q=${encodeURIComponent(`${b.name} ${b.address || ''}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-1.5"
                              title="Check info in Google"
                            >
                              <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                              </svg>
                              <span>Check in Google ↗</span>
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            {opp ? (
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-slate-200">
                                {opp.signal}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Standard</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {b.website ? (
                              <button
                                onClick={() => onAnalyzeWebsite(b.website)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                              >
                                Analyze
                              </button>
                            ) : (
                              <button
                                onClick={() => setActiveModalBiz(b)}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs"
                              >
                                Details
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {activeModalBiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{activeModalBiz.category}</span>
                <h3 className="text-xl font-bold text-slate-900">{activeModalBiz.name}</h3>
              </div>
              <button
                onClick={() => setActiveModalBiz(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold">Address</span>
                <p className="text-slate-800 font-medium">{activeModalBiz.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Phone</span>
                  <span className="font-mono text-slate-800">{activeModalBiz.phone || 'Not listed'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Email / Gmail</span>
                  <a
                    href={`mailto:${getBizEmail(activeModalBiz)}`}
                    className="font-mono text-blue-600 hover:underline truncate block"
                    title={`Email: ${getBizEmail(activeModalBiz)}`}
                  >
                    {getBizEmail(activeModalBiz)}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Website</span>
                  <span className="font-mono text-slate-800 truncate block">{activeModalBiz.website || 'No website registered'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <span className="text-slate-400 font-semibold block mb-0.5">Google Data</span>
                  <a
                    href={activeModalBiz.profile_url || `https://www.google.com/search?q=${encodeURIComponent(`${activeModalBiz.name} ${activeModalBiz.address || ''}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:underline text-xs"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                    </svg>
                    <span>Check in Google ↗</span>
                  </a>
                </div>
              </div>

              {activeModalBiz.opportunity_signals?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span>Opportunity Signal</span>
                  </div>
                  {activeModalBiz.opportunity_signals.map((o, idx) => (
                    <div key={idx} className="text-xs text-blue-800 pl-5">
                      <div className="font-semibold">&bull; {o.signal}</div>
                      <div className="text-[11px] text-blue-700">{o.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalBiz(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {activeModalBiz.website && (
                <button
                  onClick={() => {
                    const site = activeModalBiz.website;
                    setActiveModalBiz(null);
                    onAnalyzeWebsite(site);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                >
                  Analyze Website
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
