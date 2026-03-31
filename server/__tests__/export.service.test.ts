import { ExportService } from "../src/services/export.service";

describe("ExportService", () => {
  let service: ExportService;

  beforeEach(() => {
    service = new ExportService();
  });

  test("генерує CSV рядок з заголовками", () => {
    const data = [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ];
    const csv = service.toCSV(data);
    expect(csv).toContain("name");
    expect(csv).toContain("age");
    expect(csv).toContain("Alice");
    expect(csv).toContain("Bob");
  });

  test("починається з BOM", () => {
    const csv = service.toCSV([{ a: "1" }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  test("обробляє порожній масив", () => {
    const csv = service.toCSV([]);
    expect(typeof csv).toBe("string");
  });

  test("обробляє спеціальні символи", () => {
    const data = [{ text: "слово, з комою", num: "42" }];
    const csv = service.toCSV(data);
    expect(csv).toContain("слово");
  });
});
