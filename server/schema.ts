import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  pgEnum,
  serial,
  real,
  index,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters";
import {createId} from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

export const RoleEnum = pgEnum("roles", ["user", "admin"])

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false),
  role: RoleEnum("roles").default("user"),
  customerID: text("customerID"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)
 
export const emailTokens = pgTable(
  "email_tokens",
  {
    id: text("id").notNull().$defaultFn(() => createId()),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    email: text("email").notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.id, verificationToken.token],
    }),
  })
)

export const twoFactorTokens = pgTable(
  "two_factor_tokens", 
  {
  id: text("id").notNull().$defaultFn(() => createId()),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    email: text("email").notNull(),
    userID: text("userID").references(() => users.id, {onDelete: "cascade"})
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.id, verificationToken.token],
    }),
  })
)


export const passwordResetTokens = pgTable(
  "password_reset_tokens", 
  {
  id: text("id").notNull().$defaultFn(() => createId()),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    email: text("email").notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.id, verificationToken.token],
    }),
  })
)


export const products = pgTable('products', {
id: serial('id').primaryKey(),
description: text('description').notNull(),
title: text("title").notNull(),
created: timestamp("created").defaultNow(),
price: real("price").notNull(),
})

export const productVariants = pgTable("productVariants", {
id: serial("id") .primaryKey(),
color: text("color").notNull(),
productType: text("productType") . notNull(),
updated: timestamp("updated") .defaultNow(),
productId: integer('productID').notNull().references(() => products.id, {onDelete: "cascade"}),
})

export const variantImages = pgTable("variantImages", {
id: serial("id") .primaryKey(),
url: text("url").notNull(),
size: text("size").notNull(),
name: text("name").notNull(),
order: real("order").notNull(),
// variantID: serial("variantID").notNull().references(() => productVariants.id, {onDelete: "cascade"})
variantId: integer("variantID")  // змінив на integer, оскільки це зовнішній ключ
.notNull()
.references(() => productVariants.id, { onDelete: "cascade" })
})
export const variantTags = pgTable("variantTags", {
id: serial("id") .primaryKey(),
tag: text("tag").notNull(), // змінив serial на text та видалив primaryKey
variantId: serial("variantID").notNull().references(() => productVariants.id, {onDelete: "cascade"})
})



export const productsRelations = relations(products, ({ many }) => ({
productVariants: many(productVariants, 
  
//   {
//   fields: [products.id], // Поле у таблиці products
//   references: [productVariants.productId], // Поле у таблиці productVariants
//   // relationName: 'productVariants', // Назва відношення
// }
),
reviews: many(reviews, { relationName: "reviews" }),
}));



export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
product: one(products, {
  fields: [productVariants.productId],
  references: [products.id],
  // relationName: 'productRelation', // Назва відношення
}),
// variantImages: many(variantImages, {
//   fields: [productVariants.id], // Поле у таблиці productVariants
//   references: [variantImages.variantId], // Поле у таблиці variantImages
//   // relationName: 'variantImages', // Назва відношення
// }),
// variantTags: many(variantTags, {
//   fields: [productVariants.id], // Поле у таблиці productVariants
//   references: [variantTags.variantId], // Поле у таблиці variantTags
//   // relationName: 'variantTags', // Назва відношення

// }),
variantImages: many(variantImages), // Зв'язок до variantImages
variantTags: many(variantTags), // Зв'язок до variantTags
}));

export const variantImagesRelations = relations(variantImages, ({ one }) => ({
// variant: one(productVariants, {
//   fields: [variantImages.variantId],
//   references: [productVariants.id],
//   relationName: 'variant', // Назва відношення
// }),
productVariant: one(productVariants, {
  fields: [variantImages.variantId], // Поле у таблиці variantImages
  references: [productVariants.id], // Поле у таблиці productVariants
}),
}));

export const variantTagsRelations = relations(variantTags, ({ one }) => ({
// variant: one(productVariants, {
//   fields: [variantTags.variantId],
//   references: [productVariants.id],
//   relationName: 'variant', // Назва відношення
// }),
productVariant: one(productVariants, {
  fields: [variantTags.variantId], // Поле у таблиці variantTags
  references: [productVariants.id], // Поле у таблиці productVariants
}),
}));


export const reviews = pgTable('reviews', {
id: serial('id').primaryKey(),
rating: real('rating').notNull(),
userId: text('userId').notNull().references(() => users.id, {onDelete: 'cascade'}),
productId: serial('productId').notNull().references(() => products.id, {onDelete: 'cascade'}),
comment: text('comment').notNull(),
created: timestamp('created').defaultNow(),


}, (table) => {
return {
  productIdx: index('productIdx').on(table.productId),
  userIdx: index('userIdx').on(table.userId)
}
})

export const reviewRelations = relations(reviews, ({one}) => ({
user: one(users, {
  fields: [reviews.userId],
  references: [users.id],
  // relationName: 'user_reviews'
}),
product: one(products, {
  fields: [reviews.productId],
  references: [products.id],
  relationName: 'reviews',

})
}))


export const userRelations = relations(users, ({many}) => ({
reviews: many(reviews),
orders: many(orders), 
// reviews: many(reviews, {relationName: "user_reviews"}),
// orders: many(orders, { relationName: "user_orders" }), 
}))

export const orders = pgTable("orders", {
id: serial("id").primaryKey(),
userID: text("userID")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),
total: real("total").notNull(),
status: text("status").notNull(),
created: timestamp("created").defaultNow(),
receiptURL: text("receiptURL"),
paymentIntentID: text("paymentIntentID"),
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
user: one(users, {
  fields: [orders.userID],
  references: [users.id],
  // relationName: "user_orders",
}),
orderProduct: many(orderProduct),
// orderProduct: many(orderProduct, { relationName: "orderProduct" }),
}))

export const orderProduct = pgTable("orderProduct", {
id: serial("id").primaryKey(),
quantity: integer("quantity").notNull(),
productVariantID: serial("productVariantID")
  .notNull()
  .references(() => productVariants.id, { onDelete: "cascade" }),
productID: serial("productID")
  .notNull()
  .references(() => products.id, { onDelete: "cascade" }),
orderID: serial("orderID")
  .notNull()
  .references(() => orders.id, { onDelete: "cascade" }),
})

export const orderProductRelations = relations(orderProduct, ({ one }) => ({
order: one(orders, {
  fields: [orderProduct.orderID],
  references: [orders.id],
  // relationName: "orderProduct",
}),
product: one(products, {
  fields: [orderProduct.productID],
  references: [products.id],
  // relationName: "products",
}),
productVariants: one(productVariants, {
  fields: [orderProduct.productVariantID],
  references: [productVariants.id],
  // relationName: "productVariants",
}),
})) 

export const productsQW = pgTable('productsQW', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  })