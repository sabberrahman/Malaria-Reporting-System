import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MONTH_COLUMNS,
  MONTH_LABELS,
  getDhakaMonth,
  getDhakaYear,
  getMonthTotal,
} from "@/lib/monthUtils";
import { RefreshCw, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface LocalRow {
  id: string;
  village_id: string;
  sk_user_id: string;
  reporting_year: number;
  hh: number;
  population: number;
  itn_2023: number;
  itn_2024: number;
  itn_2025: number;
  jan_cases: number;
  feb_cases: number;
  mar_cases: number;
  apr_cases: number;
  may_cases: number;
  jun_cases: number;
  jul_cases: number;
  aug_cases: number;
  sep_cases: number;
  oct_cases: number;
  nov_cases: number;
  dec_cases: number;
  // joined
  district_name?: string;
  upazila_name?: string;
  union_name?: string;
  village_name?: string;
  ward_no?: string | null;
}

type CellStatus = "RED" | "YELLOW" | "GREEN";

const LocalRecordsGrid = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";
  const currentMonth = getDhakaMonth(); // 1..12
  const currentYear = getDhakaYear();
  const isMobile = useIsMobile();

  const [year, setYear] = useState(currentYear);
  const [rows, setRows] = useState<LocalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<10 | 20 | 50 | -1>(10);

  // ---- Color logic (no DB changes) ----
  // RED: value = 0
  // YELLOW: value > 0 AND (current month + current year) AND non-admin
  // GREEN: value > 0 otherwise
  const getMonthStatus = (value: number, monthIndex: number): CellStatus => {
    if (!value || value === 0) return "RED";
    const monthNumber = monthIndex + 1;

    if (!isAdmin && year === currentYear && monthNumber === currentMonth) {
      return "YELLOW";
    }
    return "GREEN";
  };

  const getMonthBg = (status: CellStatus) => {
    // subtle but clear
    switch (status) {
      case "GREEN":
        return "bg-green-50 border-green-200";
      case "YELLOW":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-red-50 border-red-200";
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("local_records")
        .select(
          `
          *,
          villages!inner (
            name,
            ward_no,
            unions!inner (
              name,
              upazilas!inner (
                name,
                districts!inner ( name )
              )
            )
          )
        `,
        )
        .eq("reporting_year", year)
        .order("created_at");

      if (!isAdmin) {
        if (!user) {
          setRows([]);
          setDirtyIds(new Set());
          setCurrentPage(1);
          return;
        }
        query = query.eq("sk_user_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map((r: any) => ({
        ...r,
        district_name: r.villages?.unions?.upazilas?.districts?.name ?? "",
        upazila_name: r.villages?.unions?.upazilas?.name ?? "",
        union_name: r.villages?.unions?.name ?? "",
        village_name: r.villages?.name ?? "",
        ward_no: r.villages?.ward_no ?? "",
      }));

      setRows(mapped);
      setDirtyIds(new Set());
      setCurrentPage(1);
    } catch (err: any) {
      toast({
        title: "Load error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, year, isAdmin, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCellChange = (rowId: string, field: string, value: string) => {
    const num = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [field]: num } : r)));
    setDirtyIds((prev) => new Set(prev).add(rowId));
  };

  const handleSave = async () => {
    if (dirtyIds.size === 0) return;
    setSaving(true);
    try {
      const dirty = rows.filter((r) => dirtyIds.has(r.id));

      for (const r of dirty) {
        const updatePayload: Record<string, number> = {
          hh: r.hh,
          population: r.population,
          itn_2023: r.itn_2023,
          itn_2024: r.itn_2024,
          itn_2025: r.itn_2025,
        };

        MONTH_COLUMNS.forEach((col) => {
          updatePayload[col] = (r as any)[col];
        });

        const { error } = await supabase.from("local_records").update(updatePayload).eq("id", r.id);
        if (error) throw error;
      }

      setDirtyIds(new Set());
      toast({ title: "Saved successfully" });
    } catch (err: any) {
      toast({
        title: "Save error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isMonthEditable = (monthIndex: number) => {
    if (isAdmin) return true;
    if (year !== currentYear) return false;
    return monthIndex + 1 === currentMonth;
  };

  const isITNEditable = isAdmin;
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const effectiveRowsPerPage = rowsPerPage === -1 ? rows.length || 1 : rowsPerPage;
  const totalPages = isMobile ? 1 : Math.max(1, Math.ceil(rows.length / effectiveRowsPerPage));
  const pagedRows = isMobile
    ? rows
    : rows.slice((currentPage - 1) * effectiveRowsPerPage, currentPage * effectiveRowsPerPage);
  const visibleRows = isMobile
    ? pagedRows
    : [...pagedRows, ...Array.from({ length: Math.max(0, effectiveRowsPerPage - pagedRows.length) }, () => null)];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="h-9 w-full min-w-[120px] sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="h-9">
            <RefreshCw className="h-4 w-4 mr-1" /> Reload
          </Button>

          <Button size="sm" onClick={handleSave} disabled={saving || dirtyIds.size === 0} className="h-9">
            <Save className="h-4 w-4 mr-1" /> Save {dirtyIds.size > 0 && `(${dirtyIds.size})`}
          </Button>

          {!isMobile && (
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value) as 10 | 20 | 50 | -1);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[132px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="-1">All rows</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-200 border border-red-300" />
            Not submitted
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-yellow-200 border border-yellow-300" />
            Pending approval
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-200 border border-green-300" />
            Approved
          </span>
        </div>
      </div>

      <div>
        <div className="overflow-auto max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-260px)] bg-white">
          <table className="w-max min-w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b">
              <tr>
                <th className="grid-th min-w-[120px] sticky left-0 bg-gray-50 z-20">District</th>
                <th className="grid-th min-w-[120px]">Upazila</th>
                <th className="grid-th min-w-[110px]">Union</th>
                <th className="grid-th min-w-[120px]">Village</th>
                <th className="grid-th min-w-[70px]">Ward</th>
                <th className="grid-th min-w-[72px]">H/H</th>
                <th className="grid-th min-w-[84px]">Pop.</th>
                <th className="grid-th min-w-[72px]">ITN'23</th>
                <th className="grid-th min-w-[72px]">ITN'24</th>
                <th className="grid-th min-w-[72px]">ITN'25</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="grid-th min-w-[64px]">
                    {m}
                  </th>
                ))}
                <th className="grid-th min-w-[72px] font-bold">Total</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={23} className="text-center py-8 text-muted-foreground">
                    No records for {year}
                  </td>
                </tr>
              )}

              {visibleRows.map((row, rowIndex) =>
                row ? (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="grid-td sticky left-0 bg-white z-[5] font-medium">
                    {row.district_name}
                  </td>
                  <td className="grid-td">{row.upazila_name}</td>
                  <td className="grid-td">{row.union_name}</td>
                  <td className="grid-td">{row.village_name}</td>
                  <td className="grid-td">{row.ward_no || ""}</td>

                  <td className="grid-td p-0">
                    <input
                      type="number"
                      min={0}
                      className="grid-input"
                      value={row.hh}
                      onChange={(e) => handleCellChange(row.id, "hh", e.target.value)}
                    />
                  </td>

                  <td className="grid-td p-0">
                    <input
                      type="number"
                      min={0}
                      className="grid-input"
                      value={row.population}
                      onChange={(e) => handleCellChange(row.id, "population", e.target.value)}
                    />
                  </td>

                  {(["itn_2023", "itn_2024", "itn_2025"] as const).map((itnCol) => (
                    <td key={itnCol} className="grid-td p-0">
                      <input
                        type="number"
                        min={0}
                        className={`grid-input ${isITNEditable ? "" : "bg-muted/30 text-muted-foreground"}`}
                        value={(row as any)[itnCol]}
                        onChange={(e) => handleCellChange(row.id, itnCol, e.target.value)}
                        disabled={!isITNEditable}
                      />
                    </td>
                  ))}

                  {MONTH_COLUMNS.map((col, idx) => {
                    const value = (row as any)[col] as number;
                    const status = getMonthStatus(value, idx);
                    const editable = isMonthEditable(idx);

                    return (
                      <td
                        key={col}
                        className={`grid-td p-0 border ${getMonthBg(status)} ${
                          editable ? "" : "opacity-80"
                        }`}
                        title={
                          status === "GREEN"
                            ? "Approved"
                            : status === "YELLOW"
                            ? "Waiting for approval"
                            : "Not submitted"
                        }
                      >
                        <input
                          type="number"
                          min={0}
                          className={`grid-input bg-transparent ${
                            editable ? "" : "text-muted-foreground"
                          }`}
                          value={value}
                          onChange={(e) => handleCellChange(row.id, col, e.target.value)}
                          disabled={!editable}
                        />
                      </td>
                    );
                  })}

                  <td className="grid-td font-bold text-center bg-gray-50">
                    {getMonthTotal(row)}
                  </td>
                </tr>
                ) : (
                <tr key={`empty-local-${rowIndex}`} className="hidden md:table-row">
                  <td className="grid-td sticky left-0 bg-white z-[5] font-medium text-transparent">.</td>
                  {Array.from({ length: 22 }, (_, cellIndex) => (
                    <td key={cellIndex} className="grid-td text-transparent">.</td>
                  ))}
                </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isMobile && rows.length > 0 && (
        <div className="flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            Showing page {currentPage} of {totalPages}. Total rows: {rows.length}.
          </p>
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 text-xs text-slate-500">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default LocalRecordsGrid;
