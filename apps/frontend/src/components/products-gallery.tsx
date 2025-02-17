"use client"

import { useGetAllProducts } from "@/contract/hooks"
import ProductCard from "./product-card"
import { client, contract, contractAddress } from "@/contract/contract"

const ProductsGallery = () => {
   const { data: products } = contract.useCowrieMarketplaceGetListingsQuery({ 
        client, // Ensure you have a valid client instance here
        args: {
            limit: 100,
            status: "active"
        },
        options: {
            enabled: true,
            queryKey: [contract.cowrieMarketplaceQueryKeys.getListings(contractAddress, {
                limit: 100,
                status: "active"
            })],
        }
    });
    
    console.log("Products: ", products)
    return <div>
        <h1>Products Gallery</h1>
        <p>Here are some products</p>
        <ul>
            {products?.listings.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </ul>
    </div>
}

export default ProductsGallery;