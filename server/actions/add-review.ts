"use server"

import { reviewSchema } from "@/types/reviews-schema"
import { createSafeActionClient } from "next-safe-action"
import { auth } from "../auth"
import { db } from ".."
import { and, eq } from "drizzle-orm"
import { products, reviews, users } from "../schema"
import { revalidatePath } from "next/cache"

const action = createSafeActionClient()

export const addReview = action(
  reviewSchema,
  async ({ productId, rating, comment }) => {
    try {
      const session = await auth()
      if (!session) return { error: "Please sign in" }

      const reviewExists = await db.query.reviews.findFirst({
        where: and(
          eq(reviews.productId, productId),
          eq(reviews.userId, session.user.id)
        ),
      })
   
      if (reviewExists)
        return { error: "You have already reviewed this product" }
      const newReview = await db
        .insert(reviews)
        .values({
          productId,
          rating,
          comment,
          userId: session.user.id,
        })
        .returning()
      revalidatePath(`/products/${productId}`)
      return { success: newReview[0] }
    } catch (err) {
      return { error: JSON.stringify(err) }
    }
  }
)
