import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  BattleSnapshot,
  BattleStore,
  IdempotencyRecord,
  IdempotencyStore,
  ReservationOutcome,
} from "./contracts";
import { PREPARED_TOURIST_VS_PETR } from "../demo/prepared-battles";
import { parseBattleId, safeParseBattleSnapshot } from "../battle/validation";

/**
 * Bounded FIFO Cache map with maximum capacity
 */
class BoundedCache<K, V> {
  private map = new Map<K, V>();
  private maxCapacity: number;

  constructor(maxCapacity = 200) {
    this.maxCapacity = maxCapacity;
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  set(key: K, value: V): void {
    if (this.map.size >= this.maxCapacity && !this.map.has(key)) {
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) {
        this.map.delete(firstKey);
      }
    }
    this.map.set(key, value);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }
}

export class MemoryBattleStore implements BattleStore {
  private store = new Map<string, BattleSnapshot>([
    [PREPARED_TOURIST_VS_PETR.id, structuredClone(PREPARED_TOURIST_VS_PETR)],
  ]);

  async get(id: string): Promise<BattleSnapshot | null> {
    try {
      const safeId = parseBattleId(id);
      const snapshot = this.store.get(safeId);
      return snapshot ? structuredClone(snapshot) : null;
    } catch {
      return null;
    }
  }

  async create(snapshot: BattleSnapshot): Promise<void> {
    const safeId = parseBattleId(snapshot.id);
    const validated = safeParseBattleSnapshot(snapshot);
    if (!validated) {
      throw new Error(`Invalid BattleSnapshot structure for ID: ${snapshot.id}`);
    }

    if (this.store.has(safeId)) {
      throw new Error(`Battle snapshot with ID "${safeId}" already exists. Create-only violation.`);
    }

    this.store.set(safeId, structuredClone(validated));
  }

  async save(snapshot: BattleSnapshot): Promise<void> {
    return this.create(snapshot);
  }

  async has(id: string): Promise<boolean> {
    try {
      const safeId = parseBattleId(id);
      return this.store.has(safeId);
    } catch {
      return false;
    }
  }

  async listRecent(limit = 6): Promise<BattleSnapshot[]> {
    const snapshots = Array.from(this.store.values());
    snapshots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return snapshots.slice(0, limit).map((s) => structuredClone(s));
  }
}

function getDefaultDataDir(subfolder: string): string {
  const base =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? path.join("/tmp", ".data")
      : path.join(process.cwd(), ".data");
  return path.join(base, subfolder);
}

export class FileBattleStore implements BattleStore {
  private memoryCache = new BoundedCache<string, BattleSnapshot>(200);
  private dirPath: string;

  constructor(dirPath = getDefaultDataDir("battles")) {
    this.dirPath = dirPath;
    this.memoryCache.set(PREPARED_TOURIST_VS_PETR.id, structuredClone(PREPARED_TOURIST_VS_PETR));
    try {
      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath, { recursive: true });
      }
    } catch {
      // In serverless read-only environments, directory creation will fail explicitly on write
    }
  }

  async get(id: string): Promise<BattleSnapshot | null> {
    let safeId: string;
    try {
      safeId = parseBattleId(id);
    } catch {
      return null;
    }

    // 1. Check memory cache first
    const cached = this.memoryCache.get(safeId);
    if (cached) return structuredClone(cached);

    // 2. Enforce resolved-path containment
    const baseDir = path.resolve(this.dirPath);
    const resolvedPath = path.resolve(baseDir, `${safeId}.json`);
    if (!resolvedPath.startsWith(baseDir + path.sep)) {
      return null;
    }

    // 3. Read from filesystem and validate snapshot schema
    try {
      if (fs.existsSync(resolvedPath)) {
        const raw = fs.readFileSync(resolvedPath, "utf-8");
        const parsed = JSON.parse(raw);
        const validated = safeParseBattleSnapshot(parsed);
        if (validated) {
          this.memoryCache.set(safeId, structuredClone(validated));
          return structuredClone(validated);
        }
      }
    } catch {
      // Return null on read/parse errors
    }

    return null;
  }

  async create(snapshot: BattleSnapshot): Promise<void> {
    const safeId = parseBattleId(snapshot.id);
    const validated = safeParseBattleSnapshot(snapshot);
    if (!validated) {
      throw new Error(`Invalid BattleSnapshot data for ID: ${snapshot.id}`);
    }

    const baseDir = path.resolve(this.dirPath);
    const resolvedPath = path.resolve(baseDir, `${safeId}.json`);
    if (!resolvedPath.startsWith(baseDir + path.sep)) {
      throw new Error(`Path containment violation for ID: ${safeId}`);
    }

    // Check collision / create-only
    if (fs.existsSync(resolvedPath) || this.memoryCache.has(safeId)) {
      throw new Error(`Battle snapshot with ID "${safeId}" already exists. Create-only violation.`);
    }

    try {
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }

      // 'wx' flag: Open for writing, failing if path already exists (atomic create-only)
      fs.writeFileSync(resolvedPath, JSON.stringify(validated, null, 2), {
        encoding: "utf-8",
        flag: "wx",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("EEXIST")) {
        throw new Error(`Battle snapshot with ID "${safeId}" already exists. Create-only violation.`);
      }
      throw new Error(`Failed to durably persist battle snapshot to disk: ${msg}`);
    }

    this.memoryCache.set(safeId, structuredClone(validated));
  }

  async save(snapshot: BattleSnapshot): Promise<void> {
    return this.create(snapshot);
  }

  async has(id: string): Promise<boolean> {
    let safeId: string;
    try {
      safeId = parseBattleId(id);
    } catch {
      return false;
    }

    if (this.memoryCache.has(safeId)) return true;
    const baseDir = path.resolve(this.dirPath);
    const resolvedPath = path.resolve(baseDir, `${safeId}.json`);
    if (!resolvedPath.startsWith(baseDir + path.sep)) {
      return false;
    }
    return fs.existsSync(resolvedPath);
  }

  async listRecent(limit = 6): Promise<BattleSnapshot[]> {
    try {
      if (!fs.existsSync(this.dirPath)) {
        return [];
      }
      const files = await fs.promises.readdir(this.dirPath);
      const jsonFiles = files.filter((f) => f.endsWith(".json"));

      const statsWithFiles = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            const fullPath = path.join(this.dirPath, file);
            const stat = await fs.promises.stat(fullPath);
            return { file, mtime: stat.mtimeMs };
          } catch {
            return null;
          }
        })
      );

      const validFiles = statsWithFiles
        .filter((item): item is { file: string; mtime: number } => item !== null)
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, limit);

      const results: BattleSnapshot[] = [];
      for (const item of validFiles) {
        const id = item.file.replace(/\.json$/, "");
        const snapshot = await this.get(id);
        if (snapshot) {
          results.push(snapshot);
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}

export class FileIdempotencyStore implements IdempotencyStore {
  private dirPath: string;

  constructor(dirPath = getDefaultDataDir("idempotency")) {
    this.dirPath = dirPath;
    try {
      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath, { recursive: true });
      }
    } catch {
      // Handled during reserve
    }
  }

  private keyToFilePath(key: string): string {
    const safeHash = crypto.createHash("sha256").update(key).digest("hex");
    return path.join(this.dirPath, `${safeHash}.json`);
  }

  async reserve(key: string, requestDigest: string): Promise<ReservationOutcome> {
    const filePath = this.keyToFilePath(key);

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const record: IdempotencyRecord = JSON.parse(raw);

        if (record.requestDigest !== requestDigest) {
          return "mismatch";
        }

        if (record.status === "completed") {
          return "completed";
        }

        if (record.status === "pending") {
          const ageMs = Date.now() - new Date(record.updatedAt).getTime();
          // If in flight for under 45 seconds, report in flight
          if (ageMs < 45000) {
            return "in_flight";
          }
        }
      }

      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath, { recursive: true });
      }

      const now = new Date().toISOString();
      const newRecord: IdempotencyRecord = {
        key,
        requestDigest,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };

      fs.writeFileSync(filePath, JSON.stringify(newRecord, null, 2), "utf-8");
      return "reserved";
    } catch {
      return "reserved";
    }
  }

  async complete(key: string, snapshotId: string): Promise<void> {
    const filePath = this.keyToFilePath(key);
    try {
      let record: IdempotencyRecord;
      if (fs.existsSync(filePath)) {
        record = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } else {
        const now = new Date().toISOString();
        record = { key, requestDigest: "", status: "completed", createdAt: now, updatedAt: now };
      }

      record.status = "completed";
      record.snapshotId = snapshotId;
      record.updatedAt = new Date().toISOString();

      fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
    } catch (err) {
      console.warn("FileIdempotencyStore: failed to mark completed:", err);
    }
  }

  async fail(key: string, error: string): Promise<void> {
    const filePath = this.keyToFilePath(key);
    try {
      let record: IdempotencyRecord;
      if (fs.existsSync(filePath)) {
        record = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } else {
        const now = new Date().toISOString();
        record = { key, requestDigest: "", status: "failed", createdAt: now, updatedAt: now };
      }

      record.status = "failed";
      record.error = error;
      record.updatedAt = new Date().toISOString();

      fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf-8");
    } catch (err) {
      console.warn("FileIdempotencyStore: failed to mark failed:", err);
    }
  }

  async get(key: string): Promise<IdempotencyRecord | null> {
    const filePath = this.keyToFilePath(key);
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch {
      // return null
    }
    return null;
  }
}

export const memoryBattleStore = new MemoryBattleStore();
export const defaultBattleStore: BattleStore = new FileBattleStore();
export const defaultIdempotencyStore: IdempotencyStore = new FileIdempotencyStore();
