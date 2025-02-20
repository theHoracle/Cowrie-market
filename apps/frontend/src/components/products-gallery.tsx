import { useGetAllProducts } from "@/contract/hooks"
import ProductCard from "./product-card"
import { client, contract, contractAddress } from "@/contract/contract"

const ProductsGallery = async () => {
   
 const  products = await client.getListings({
    limit: 100,
    status: "active"
  }) 
  


    console.log("Products: ", products)
    return <div>
        <h1>Products Gallery</h1>
        <p>Here are some products</p>
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products?.listings.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </ul>
    </div>
}

export default ProductsGallery;
