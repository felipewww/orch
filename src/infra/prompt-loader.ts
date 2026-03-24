import * as fs from "node:fs";
import * as path from "node:path";

export function loadPrompt(relativePath: string): string {
    const absolutePath = path.join(process.cwd(), relativePath);
    return fs.readFileSync(absolutePath, "utf-8").trim();
}
