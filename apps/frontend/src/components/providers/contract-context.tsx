import { createContext } from "react"
import { CowrieMarketplaceInterface } from "@thehoracle/cowrie-marketplace-types/dist/CowrieMarketplace.client"

type ContractContextType = {
  queryClient: CowrieMarketplaceInterface,
  executeClient: CowrieMarketplaceInterface
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({children}: { children: React.ReactNode }) {
  const client = async () => {
    const {} = awaiit initializeQueryClient() 
  } 
}
