"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { ActionResult } from "@/lib/action-utils";
import { ImportSummary } from "@/lib/actions/csv-import";
import {
  projectCsvRowSchema,
  contractorCsvRowSchema,
  PROJECT_CSV_COLUMNS,
  CONTRACTOR_CSV_COLUMNS,
  ProjectCsvRow,
  ContractorCsvRow,
} from "@/lib/validations/csv";

interface ParsedRow<T> {
  rowNumber: number;
  raw: Record<string, string>;
  data: T | null;
  errors: string[];
}

// Zod schemas are class instances and can't cross the Server -> Client Component
// boundary as props, so the panel resolves schema/columns from a plain string instead.
const ENTITY_CONFIG = {
  project: { schema: projectCsvRowSchema, columns: PROJECT_CSV_COLUMNS as string[] },
  contractor: { schema: contractorCsvRowSchema, columns: CONTRACTOR_CSV_COLUMNS as string[] },
} as const;

type EntityType = keyof typeof ENTITY_CONFIG;
type RowFor<E extends EntityType> = E extends "project" ? ProjectCsvRow : ContractorCsvRow;

export function CsvImportPanel<E extends EntityType>({
  title,
  templateUrl,
  entityType,
  onImport,
}: {
  title: string;
  templateUrl: string;
  entityType: E;
  onImport: (rows: RowFor<E>[], fileName: string) => Promise<ActionResult<ImportSummary>>;
}) {
  type T = RowFor<E>;
  // The union collapses structurally here since E isn't narrowed at this point in the
  // function body; the runtime lookup is correct for the given entityType, so this
  // re-assertion just restores the per-instance type TypeScript can't infer generically.
  const config = ENTITY_CONFIG[entityType] as unknown as {
    schema: import("zod").ZodType<T>;
    columns: string[];
  };
  const { schema: rowSchema, columns } = config;
  const [rows, setRows] = useState<ParsedRow<T>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleFileSelect(file: File | null) {
    setSummary(null);
    setParseError(null);
    if (!file) return;
    setFileName(file.name);

    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.data.length === 0) {
      setParseError("No rows found in this file.");
      setRows([]);
      return;
    }

    const missingColumns = columns.filter((c) => !(parsed.meta.fields ?? []).includes(c));
    if (missingColumns.length > 0) {
      setParseError(`Missing required columns: ${missingColumns.join(", ")}`);
      setRows([]);
      return;
    }

    const nextRows: ParsedRow<T>[] = parsed.data.map((raw, idx) => {
      const result = rowSchema.safeParse(raw);
      return {
        rowNumber: idx + 1,
        raw,
        data: result.success ? result.data : null,
        errors: result.success ? [] : result.error.issues.map((issue) => `${String(issue.path[0])}: ${issue.message}`),
      };
    });

    setRows(nextRows);
  }

  const validRows = rows.filter((r) => r.data);
  const invalidRows = rows.filter((r) => !r.data);

  async function handleConfirmImport() {
    if (!fileName || validRows.length === 0) return;
    setImporting(true);
    const result = await onImport(validRows.map((r) => r.data as T), fileName);
    setImporting(false);

    if (!result.success) {
      toast(result.error, "error");
      return;
    }
    setSummary(result.data);
    setRows([]);
    toast("Import complete");
  }

  function reset() {
    setRows([]);
    setFileName(null);
    setSummary(null);
    setParseError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <a
          href={templateUrl}
          download
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download Sample Template
        </a>
      </div>

      {!summary && (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-3 py-6 text-sm text-gray-400 hover:border-primary hover:text-primary"
          >
            <Upload className="h-5 w-5" />
            {fileName ? fileName : "Select CSV File"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {parseError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {parseError}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Total rows: {rows.length}</span>
            <span className="text-green-700">Valid: {validRows.length}</span>
            {invalidRows.length > 0 && <span className="text-red-700">Errors: {invalidRows.length}</span>}
          </div>

          <div className="max-h-80 overflow-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  {columns.slice(0, 4).map((col) => (
                    <th key={col} className="px-3 py-2">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.rowNumber} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                    <td className="px-3 py-2">{row.rowNumber}</td>
                    {columns.slice(0, 4).map((col) => (
                      <td key={col} className="px-3 py-2">
                        {row.raw[col]}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {row.errors.length > 0 ? (
                        <span className="text-red-600" title={row.errors.join("; ")}>
                          {row.errors.join("; ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={reset}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmImport} loading={importing} disabled={validRows.length === 0}>
              Confirm Import ({validRows.length} rows)
            </Button>
          </div>
        </div>
      )}

      {summary && (
        <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
          <p className="font-medium text-gray-900">Import Summary</p>
          <p>Total rows: {summary.totalRows}</p>
          <p className="text-green-700">Imported: {summary.successCount}</p>
          {summary.duplicateCount > 0 && <p className="text-amber-700">Skipped duplicates: {summary.duplicateCount}</p>}
          {summary.errorCount > 0 && <p className="text-red-700">Failed: {summary.errorCount}</p>}
          {summary.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-600">
              {summary.errors.map((e) => (
                <li key={e.row}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={reset}>
            Import Another File
          </Button>
        </div>
      )}
    </div>
  );
}
