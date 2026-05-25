import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { config } from "dotenv";
import postgres from "postgres";
import { createId } from "@paralleldrive/cuid2";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim()
    .slice(0, 191);
}

function parseTags(tagString) {
  if (!tagString) return [];
  return tagString
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function parseSourceUrls(url) {
  if (!url) return [];
  return [{ site: "Nykaa", url: url.trim() }];
}

const records = [];

createReadStream("scripts/products.csv")
  .pipe(parse({ columns: true, skip_empty_lines: true }))
  .on("data", (row) => records.push(row))
  .on("end", async () => {
    console.log(`interting ${records.length} products`);
    let success = 0;
    let failed = 0;

    for (const row of records) {
      try {
        const slug = slugify(row.product_title);

        await sql`
            INSERT INTO products (
                id,
                name,
                slug,
                brand,
                rating,
                images,
                tags,
                price,
                stock,
                collection_id,
                "totalComments",
                source_urls,
                created_at
            ) VALUES (
                ${createId()},
                ${row.product_title},
                ${slug},
                ${row.brand_name || null},
                ${parseFloat(row.rating) || 0.0},
                ${JSON.stringify([row.image_url].filter(Boolean))},
                ${JSON.stringify(parseTags(row.tags))},
                ${parseFloat(row.price) * 1.25 || 0},
                ${row.in_stock === "True" ? 8 : 0},
                ${null},
                ${0},
                ${JSON.stringify(parseSourceUrls(row.product_url))},
                NOW()
            )
            ON CONFLICT (slug) DO NOTHING
        `;
        success++;
      } catch (err) {
        console.error(`failed: ${row.collection_id} error: \n ${err.message}`);
        failed++;
      }
    }
    console.log(`Done!  ${success} inserted , ${failed} failed`);
    await sql.end();
  })
  .on("error", (err) => {
    console.error("read error");
    process.exit(1);
  });
