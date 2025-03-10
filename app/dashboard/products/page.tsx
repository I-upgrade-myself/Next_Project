
import { db } from "@/server"
import { DataTable } from "./data-table";
import { columns } from "./columns";
import placeholder from "@/public/publicio_logo.jpg"
export default async function Products() {
    
    const products = await db.query.products.findMany({
        with: {
            productVariants: {with: {variantImages: true, variantTags: true}}
        },
        orderBy: (products, { desc }) => [desc(products.id)],
      });
  
if (!products) throw new Error("No products found")

const dataTable = products.map((product) => {
    if(product.productVariants.length === 0) {
return{
id: product.id,
title: product.title,
price: product.price,
variants: [],
image: placeholder.src,
}
    }
    const image = product.productVariants?.[0]?.variantImages?.[0]?.url ?? placeholder;

    return {
        id: product.id,
        title: product.title,
        price: product.price,
        variants: product.productVariants,
        image,
    }
})
if(!dataTable) throw new Error("No data found")
return (
    <div>
    <DataTable columns={columns} data={dataTable}/>
    </div>
    
    )
}