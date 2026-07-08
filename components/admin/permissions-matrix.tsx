import { getTranslations } from "next-intl/server";
import { Check, Minus } from "lucide-react";

const ROWS: { labelKey: string; cells: (boolean | "delegated")[] }[] = [
  { labelKey: "row1", cells: [true, true, false, false, false] },
  { labelKey: "row2", cells: [true, true, true, false, false] },
  { labelKey: "row3", cells: [true, true, true, true, false] },
  { labelKey: "row4", cells: [true, true, true, true, false] },
  { labelKey: "row5", cells: [true, true, true, "delegated", false] },
  { labelKey: "row6", cells: [true, "delegated", "delegated", "delegated", false] },
  { labelKey: "row7", cells: [true, "delegated", false, false, false] },
  { labelKey: "row8", cells: [true, "delegated", false, false, false] },
  { labelKey: "row9", cells: [true, true, true, true, false] },
  { labelKey: "row10", cells: [true, false, false, false, false] },
  { labelKey: "row11", cells: [true, false, false, false, false] },
];

const COLUMNS = ["Owner", "Admin", "Editor", "Member", "Guest"];

export async function PermissionsMatrix() {
  const t = await getTranslations("admin");
  const tm = await getTranslations("admin.matrix");
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-surface-2">
              <th className="p-3 text-left font-semibold text-foreground">{t("permissionsMatrix")}</th>
              {COLUMNS.map((col) => (
                <th key={col} className="p-3 text-center font-semibold text-foreground">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.labelKey} className="border-t border-border">
                <td className="p-3 text-foreground">{tm(row.labelKey as never)}</td>
                {row.cells.map((cell, j) => (
                  <td key={j} className="p-3 text-center">
                    {cell === true ? (
                      <Check className="mx-auto h-4 w-4 text-success" />
                    ) : cell === "delegated" ? (
                      <span className="text-xs font-semibold text-gold-700">*</span>
                    ) : (
                      <Minus className="mx-auto h-4 w-4 text-border" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{t("delegatedNote")}</p>
    </div>
  );
}
