import { stringify } from "csv-stringify/sync";
import type { IExportService, LabeledRow, RawRow } from "../types";

export class ExportService implements IExportService {
  toCSV(data: RawRow[] | LabeledRow[]): string {
    const csv = stringify(data, { header: true, bom: true });
    return "\ufeff" + csv;
  }
}
