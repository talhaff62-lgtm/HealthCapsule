export type StoredImage = {
  url: string; // web-servable URL or absolute URL
  key: string; // storage path/key, used later for deletion
  width: number;
  height: number;
  bytes: number; // size of the STORED file, not the input
  contentType: string;
};

export type StoreImageInput = {
  data: Buffer;
  folder: string; // e.g. "doctors" | "facilities"
  filename?: string; // original upload name, used ONLY as a format hint, NEVER trusted for the stored path
};

export type StoreImage = (input: StoreImageInput) => Promise<StoredImage>;

export type StorageProvider = "local" | "supabase";

export function getStorageProvider(): StorageProvider {
  const rawProvider = process.env.STORAGE_PROVIDER;
  const provider = rawProvider ? rawProvider.trim().toLowerCase() : "";

  if (provider !== "local" && provider !== "supabase") {
    throw new Error(
      `Invalid or unset STORAGE_PROVIDER: "${rawProvider ?? ""}". Accepted values are "local" or "supabase".`
    );
  }

  const missingVars: string[] = [];
  if (provider === "local") {
    if (!process.env.STORAGE_DIRECTORY || process.env.STORAGE_DIRECTORY.trim() === "") {
      missingVars.push("STORAGE_DIRECTORY");
    }
  } else if (provider === "supabase") {
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.trim() === "") {
      missingVars.push("SUPABASE_URL");
    }
    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY.trim() === ""
    ) {
      missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variable(s) for STORAGE_PROVIDER="${provider}": ${missingVars.join(", ")}`
    );
  }

  return provider;
}

export const storeImage: StoreImage = async (
  input: StoreImageInput
): Promise<StoredImage> => {
  const provider = getStorageProvider();

  if (provider === "local") {
    try {
      const { storeImageLocal } = await import("./local-storage");
      return await storeImageLocal(input);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code?: string }).code === "MODULE_NOT_FOUND"
      ) {
        throw new Error(
          `Failed to load local storage provider. Ensure "sharp" is installed (run: npm install sharp). Details: ${err.message}`
        );
      }
      throw err;
    }
  }

  if (provider === "supabase") {
    try {
      const { storeImageSupabase } = await import("./supabase-storage");
      return await storeImageSupabase(input);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code?: string }).code === "MODULE_NOT_FOUND"
      ) {
        throw new Error(
          `Failed to load Supabase storage provider. Ensure "@supabase/supabase-js" and "sharp" are installed (run: npm install @supabase/supabase-js sharp). Details: ${err.message}`
        );
      }
      throw err;
    }
  }

  throw new Error(`Unsupported storage provider: ${provider}`);
};
