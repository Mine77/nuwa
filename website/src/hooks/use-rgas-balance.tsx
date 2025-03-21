import {useCurrentAddress, useRoochClient} from "@roochnetwork/rooch-sdk-kit";
import {useQuery} from "@tanstack/react-query";

export default function useRgasBalance() {
  const client = useRoochClient()
  const address = useCurrentAddress()

  const {
    data: rGas,
    isPending,
    isError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['useRgas', address],
    queryFn: async () => {
      return await client
        .getBalance({
          owner: address!.toStr(),
          coinType: '0x3::gas_coin::RGas',
        })
    },
    enabled: !!address
  })

  return {
    rGas, isPending, isError, refetchBalance
  }
}