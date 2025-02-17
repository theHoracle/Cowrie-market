import { client, contract,  } from "./contract"


export const useGetProduct = (id: number) => {
    return contract.useCowrieMarketplaceGetListingQuery({
        args: {
            listingId: id
        },
        client: client,
    })
}

export const useGetAllProducts = () => {
    return contract.useCowrieMarketplaceGetListingsQuery({
        args: {
            limit: 100,
            status: "active"
        },
        client: client,
    })
}

