import { parse } from "csv-parse/sync";
import type { IDataService, RawRow } from "../types";

export class DataService implements IDataService {
  private data: RawRow[] | null = null;
  private fileName = "";

  getData(): RawRow[] | null {
    return this.data;
  }

  setData(rows: RawRow[], fileName: string): void {
    this.data = rows;
    this.fileName = fileName;
  }

  getFileName(): string {
    return this.fileName;
  }

  getColumns(): string[] {
    if (!this.data || this.data.length === 0) return [];
    return Object.keys(this.data[0]);
  }

  getNumericColumns(): string[] {
    if (!this.data || this.data.length === 0) return [];
    const cols = Object.keys(this.data[0]);
    return cols.filter((col) =>
      this.data!.some((row) => !isNaN(parseFloat(row[col])) && row[col] !== ""),
    );
  }

  parseCSV(content: string): RawRow[] {
    const records: RawRow[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
    return records;
  }

  generateSampleData(count: number): RawRow[] {
    const safeCount = Math.min(Math.max(count, 10), 2000);

    type Pair = [number, number];
    const segments: {
      ratio: number;
      total: Pair;
      count: Pair;
      avg: Pair;
      days: Pair;
      loyalty: Pair;
    }[] = [
      {
        ratio: 0.2,
        total: [15000, 3000],
        count: [50, 10],
        avg: [300, 50],
        days: [5, 3],
        loyalty: [90, 5],
      },
      {
        ratio: 0.33,
        total: [5000, 1500],
        count: [25, 8],
        avg: [200, 40],
        days: [15, 7],
        loyalty: [70, 10],
      },
      {
        ratio: 0.25,
        total: [1500, 500],
        count: [8, 3],
        avg: [180, 60],
        days: [60, 20],
        loyalty: [40, 15],
      },
      {
        ratio: 0.22,
        total: [500, 300],
        count: [3, 2],
        avg: [150, 70],
        days: [180, 50],
        loyalty: [15, 10],
      },
    ];

    const rows: RawRow[] = [];
    let id = 1;

    for (const seg of segments) {
      const n = Math.round(safeCount * seg.ratio);
      for (let i = 0; i < n && rows.length < safeCount; i++) {
        rows.push(this.buildRow(id++, seg));
      }
    }

    while (rows.length < safeCount) {
      const seg = segments[Math.floor(Math.random() * segments.length)];
      rows.push(this.buildRow(id++, seg));
    }

    return rows;
  }

  private buildRow(
    id: number,
    seg: {
      total: [number, number];
      count: [number, number];
      avg: [number, number];
      days: [number, number];
      loyalty: [number, number];
    },
  ): RawRow {
    return {
      client_id: `CL-${String(id).padStart(4, "0")}`,
      client_name: `Клієнт ${id}`,
      total_purchases: Math.max(
        0,
        randNorm(seg.total[0], seg.total[1]),
      ).toFixed(2),
      purchase_count: String(
        Math.max(0, Math.round(randNorm(seg.count[0], seg.count[1]))),
      ),
      avg_purchase: Math.max(0, randNorm(seg.avg[0], seg.avg[1])).toFixed(2),
      days_since_last: String(
        Math.max(0, Math.round(randNorm(seg.days[0], seg.days[1]))),
      ),
      loyalty_score: Math.max(
        0,
        Math.min(100, randNorm(seg.loyalty[0], seg.loyalty[1])),
      ).toFixed(1),
    };
  }
}

/** Box-Muller random normal distribution. */
function randNorm(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
