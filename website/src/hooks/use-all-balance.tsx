import {useCurrentAddress, useRoochClient} from "@roochnetwork/rooch-sdk-kit";
import {useQuery} from "@tanstack/react-query";

export default function useAllBalance() {
  const client = useRoochClient()
  const address = useCurrentAddress()

  const {
    data: balance,
    isPending,
    isError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['useBalance', address],
    queryFn: async () => {
      const balance = await client
        .getBalances({
          owner: address!.toStr(),
        })
      return balance
    },
    enabled: !!address
  })

  return {
    balance, isPending, isError, refetchBalance
  }
}