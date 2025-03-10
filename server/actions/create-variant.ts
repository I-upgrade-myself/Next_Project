"use server"

import { VariantSchema } from "@/types/variant-schema"
import { createSafeActionClient } from "next-safe-action"
import { db } from ".."
import {
  productVariants,
  products,
  variantImages,
  variantTags,
} from "../schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import algoliasearch from "algoliasearch"

const action = createSafeActionClient()

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_ID!,
  process.env.ALGOLIA_ADMIN!
)

const algoliaIndex = client.initIndex("products")

export const createVariant = action(
  VariantSchema,
  async ({
    color,
    editMode,
    id,
    productID,
    productType,
    tags,
    variantImages: newImgs,
  }) => {
    try {
      console.log("Received data:", {
        color,
        editMode,
        id,
        productID,
        productType,
        tags,
        newImgs,
      });
      if (editMode && id) {
        const editVariant = await db
          .update(productVariants)
          .set({ color, productType, updated: new Date() })
          .where(eq(productVariants.id, id))
          .returning()
        await db
          .delete(variantTags)
          .where(eq(variantTags.variantId, editVariant[0].id))
        await db.insert(variantTags).values(
          tags.map((tag: any) => ({
            tag,
            variantId: editVariant[0].id,
          }))
        )
        console.log("Updated variant:", editVariant);
        await db
          .delete(variantImages)
          .where(eq(variantImages.variantId, editVariant[0].id))
        await db.insert(variantImages).values(
          newImgs.map((img: { name: any; size: any; url: any }, idx: any) => ({
            name: img.name,
            size: img.size,
            url: img.url,
            variantId: editVariant[0].id,
            order: idx,
          }))
        )
        algoliaIndex.partialUpdateObject({
          objectID: editVariant[0].id.toString(),
          id: editVariant[0].productId,
          productType: editVariant[0].productType,
          variantImages: newImgs[0].url,
        })
        revalidatePath("/dashboard/products")
        return { success: `Edited ${productType}` }
      }
      
      if (!editMode) {
        const newVariant = await db
          .insert(productVariants)
          .values({
            color,
            productType,
            productId: productID, 
          })
          .returning()
          console.log("Created new variant:", newVariant[0].id);
          console.log("Created new variant:", newVariant);
        const product = await db.query.products.findFirst({
          where: eq(products.id, productID),
        })
        console.log("Inserted variantTags:", tags);
        await db.insert(variantTags).values(
          tags.map((tag: any) => ({
            tag,
            variantId: newVariant[0].id,
          }))
        )
        await db.insert(variantImages).values(
          newImgs.map((img: { name: any; size: any; url: any }, idx: any) => ({
            name: img.name,
            size: img.size,
            url: img.url,
            variantId: newVariant[0].id,
            order: idx,
          }))
        )
        console.log("Inserted variantImages:", newImgs);
        if (product) {
          algoliaIndex.saveObject({
            objectID: newVariant[0].id.toString(),
            id: newVariant[0].productId,
            title: product.title,
            price: product.price,
            productType: newVariant[0].productType,
            variantImages: newImgs[0].url,
          })
          console.log("Updated Algolia index");
        }
        revalidatePath("/dashboard/products")
        return { success: `Added ${productType}` }
      }
    } catch (error) {
      console.error("Error creating variant:", error);
      return { error: "Failed to create variant" }
    }
  }
)

