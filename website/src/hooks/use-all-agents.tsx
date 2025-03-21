import {useNetworkVariable} from "./use-networks.ts";
import {useRoochClient} from "@roochnetwork/rooch-sdk-kit";
import {useQuery} from "@tanstack/react-query";
import {RoochAddress} from "@roochnetwork/rooch-sdk";

export default function useAllAgents() {
  const client = useRoochClient()
  const packageId = useNetworkVariable('packageId')

  const {
    data: agents,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['useAllAgents'],
    queryFn: async () => {
      const agentsResponse = await client.queryObjectStates({
        filter: {
          object_type: `${packageId}::agent::Agent`,
        },
      })

      return agentsResponse.data.map(obj => {
        const agentData = obj.decoded_value?.value || {};
        const agentAddress = agentData.agent_address ?
          new RoochAddress(String(agentData.agent_address)).toBech32Address() : '';

        return {
          id: obj.id,
          name: String(agentData.name || 'Unnamed Agent'),
          username: String(agentData.username || 'unnamed'),
          description: String(agentData.description || 'No description available'),
          avatar: String(agentData.avatar || ''),
          agent_address: agentAddress,
        };
      })
    },
  })

  return {
    agents:agents??[], isPending, isError, refetch
  }
}