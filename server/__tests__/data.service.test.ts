import { DataService } from "../src/services/data.service";

describe("DataService", () => {
  let service: DataService;

  beforeEach(() => {
    service = new DataService();
  });

  describe("getData / setData", () => {
    test("повертає null коли даних немає", () => {
      expect(service.getData()).toBeNull();
    });

    test("зберігає та повертає дані", () => {
      const rows = [{ a: "1", b: "2" }];
      service.setData(rows, "test.csv");
      expect(service.getData()).toEqual(rows);
      expect(service.getFileName()).toBe("test.csv");
    });
  });

  describe("getColumns / getNumericColumns", () => {
    test("повертає порожній масив без даних", () => {
      expect(service.getColumns()).toEqual([]);
      expect(service.getNumericColumns()).toEqual([]);
    });

    test("повертає усі колонки", () => {
      service.setData([{ x: "1", y: "text", z: "3.14" }], "f.csv");
      expect(service.getColumns()).toEqual(["x", "y", "z"]);
    });

    test("повертає лише числові колонки", () => {
      service.setData(
        [
          { name: "Alice", age: "30", score: "9.5" },
          { name: "Bob", age: "25", score: "8.0" },
        ],
        "f.csv",
      );
      expect(service.getNumericColumns()).toEqual(["age", "score"]);
    });

    test("виключає порожні стовпці", () => {
      service.setData([{ a: "", b: "10" }], "f.csv");
      expect(service.getNumericColumns()).toEqual(["b"]);
    });
  });

  describe("parseCSV", () => {
    test("парсить CSV рядок з заголовками", () => {
      const csv = "name,age\nAlice,30\nBob,25\n";
      const result = service.parseCSV(csv);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: "Alice", age: "30" });
    });

    test("пропускає порожні рядки", () => {
      const csv = "a,b\n1,2\n\n3,4\n";
      const result = service.parseCSV(csv);
      expect(result).toHaveLength(2);
    });

    test("обрізає пробіли", () => {
      const csv = "a , b \n 1 , 2 \n";
      const result = service.parseCSV(csv);
      expect(result[0]).toEqual({ a: "1", b: "2" });
    });
  });

  describe("generateSampleData", () => {
    test("генерує задану кількість записів", () => {
      const rows = service.generateSampleData(100);
      expect(rows).toHaveLength(100);
    });

    test("обмежує мінімум 10 записів", () => {
      const rows = service.generateSampleData(1);
      expect(rows).toHaveLength(10);
    });

    test("обмежує максимум 2000 записів", () => {
      const rows = service.generateSampleData(5000);
      expect(rows).toHaveLength(2000);
    });

    test("генерує записи з очікуваними полями", () => {
      const rows = service.generateSampleData(10);
      const row = rows[0];
      expect(row).toHaveProperty("client_id");
      expect(row).toHaveProperty("client_name");
      expect(row).toHaveProperty("total_purchases");
      expect(row).toHaveProperty("purchase_count");
      expect(row).toHaveProperty("avg_purchase");
      expect(row).toHaveProperty("days_since_last");
      expect(row).toHaveProperty("loyalty_score");
    });

    test("client_id має формат CL-XXXX", () => {
      const rows = service.generateSampleData(10);
      for (const row of rows) {
        expect(row.client_id).toMatch(/^CL-\d{4}$/);
      }
    });

    test("loyalty_score у межах [0, 100]", () => {
      const rows = service.generateSampleData(200);
      for (const row of rows) {
        const val = parseFloat(row.loyalty_score);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      }
    });

    test("числові поля є коректними числами", () => {
      const rows = service.generateSampleData(50);
      for (const row of rows) {
        expect(parseFloat(row.total_purchases)).not.toBeNaN();
        expect(parseInt(row.purchase_count)).not.toBeNaN();
        expect(parseFloat(row.avg_purchase)).not.toBeNaN();
        expect(parseInt(row.days_since_last)).not.toBeNaN();
      }
    });
  });
});
