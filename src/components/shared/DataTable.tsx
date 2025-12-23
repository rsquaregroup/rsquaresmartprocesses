import { ReactNode, useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number | null | undefined;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  pageSize = 10,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, true])),
  );

  useEffect(() => {
    setVisibleColumns((prev) => {
      const next = { ...prev };
      columns.forEach((c) => {
        if (next[c.key] === undefined) next[c.key] = true;
      });
      // Remove old keys
      Object.keys(next).forEach((k) => {
        if (!columns.find((c) => c.key === k)) {
          delete next[k];
        }
      });
      return next;
    });
  }, [columns]);

  const displayedColumns = useMemo(
    () => columns.filter((col) => visibleColumns[col.key] !== false),
    [columns, visibleColumns],
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    onSearch?.(value);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) => String(val ?? "").toLowerCase().includes(query)),
    );
  }, [data, searchQuery]);

  const sortColumn = useMemo(() => columns.find((c) => c.key === sortKey), [columns, sortKey]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const valueFor = (item: T) => {
      if (sortColumn.sortValue) return sortColumn.sortValue(item);
      return (item as Record<string, unknown>)[sortColumn.key];
    };

    return [...filteredData].sort((a, b) => {
      const aVal = valueFor(a);
      const bVal = valueFor(b);
      const aStr = aVal === undefined || aVal === null ? "" : String(aVal);
      const bStr = bVal === undefined || bVal === null ? "" : String(bVal);
      if (aStr === bStr) return 0;
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const toggleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 text-rose-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-4 w-4 text-rose-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-rose-400" />
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        {searchable ? (
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary dark:text-white" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-12 rounded-2xl border border-primary bg-transparent pl-12 text-base text-primary dark:text-white placeholder:text-primary/60 dark:placeholder:text-white/60 focus:border-primary focus:ring-primary"
            />
          </div>
        ) : (
          <div />
        )}
        <DropdownMenu open={columnsMenuOpen} onOpenChange={setColumnsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 gap-2 px-4 py-3 rounded-lg text-foreground hover:bg-accent hover:text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-primary">
            <DropdownMenuLabel className="text-primary">Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={visibleColumns[col.key] !== false}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) =>
                  setVisibleColumns((prev) => ({ ...prev, [col.key]: Boolean(checked) }))
                }
                className="text-primary"
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setColumnsMenuOpen(false)}>
                Close
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur dark:border-transparent dark:bg-transparent dark:backdrop-blur-0">
        <Table>
          <TableHeader className="bg-white/60 dark:bg-transparent">
            <TableRow className="hover:bg-white/60 dark:hover:bg-primary/10">
              {displayedColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-sm font-normal text-foreground dark:text-white ${column.sortable === false ? "" : "cursor-pointer"}`}
                  onClick={() => toggleSort(column.key, column.sortable)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.label}</span>
                    {column.sortable === false ? null : sortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={displayedColumns.length || 1} className="py-10 text-center text-muted-foreground dark:text-white">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  className="border-b border-rose-100/70 hover:bg-primary/10"
                >
                  {displayedColumns.map((column) => (
                    <TableCell key={column.key} className="py-5 text-base text-neutral-800 dark:text-white">
                      {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-white/70 dark:bg-transparent px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9 rounded-xl px-3 text-foreground hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page <span className="font-normal text-foreground">{currentPage}</span> of {totalPages}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-9 rounded-xl px-3 text-foreground hover:bg-accent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
