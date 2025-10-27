declare global {
  namespace PrismaJson {
    type ProductMetadata = {
      tags: string[];
      featured: boolean;
      weight?: number;
    };
  }
}

// This file must be a module.
export {};
