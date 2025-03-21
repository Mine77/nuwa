import {useNetworkVariable} from "./use-networks.ts";
import {useCurrentAddress, useRoochClient} from "@roochnetwork/rooch-sdk-kit";
import {useQuery} from "@tanstack/react-query";

export default function useAgentCaps() {
  const client = useRoochClient()
  const packageId = useNetworkVariable('packageId')
  const address = useCurrentAddress()

  const {
    data: caps,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['useAgentCaps', address],
    queryFn: async () => {
      const agentCapsResponse = await client.queryObjectStates({
        filter: {
            object_type_with_owner: {
              object_type: `${packageId}::agent_cap::AgentCap`,
              owner: address!.toStr(),
            }
          },
      })

      return new Map(
        agentCapsResponse.data
          .filter((obj) => obj.decoded_value?.value?.agent_obj_id)
          .map((obj) => [
            String(obj.decoded_value!.value.agent_obj_id), 
            {
              id: obj.id,
              agentId: String(obj.decoded_value!.value.agent_obj_id),
            }, 
          ])
      );
    },
    enabled: !!address
  })

  return {
    caps: caps ?? new Map(), isPending, isError, refetch
  }
}