import {useRoochClient} from "@roochnetwork/rooch-sdk-kit";
import {useQuery} from "@tanstack/react-query";
import {RoochAddress} from "@roochnetwork/rooch-sdk";

export default function useAgent({id}:{id: string}) {
  const client = useRoochClient()

  const {
    data: agent,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['useAgent', id],
    queryFn: async () => {
      const agentsResponse = await client.queryObjectStates({
        filter: {
          object_id: id,
        },
      })

      const agents=  agentsResponse.data.map(obj => {
        const agentObj = agentsResponse.data[0];
        const agentData = obj.decoded_value?.value || {};
        const agentAddress = agentData.agent_address ?
          new RoochAddress(String(agentData.agent_address)).toBech32Address() : '';

          return {
            id: agentObj.id,
            name: String(agentData.name || 'Unnamed Agent'),
            username: String(agentData.username || ''),
            description: String(agentData.description || ''),
            instructions: String(agentData.instructions || ''),
            agent_address: agentAddress,
            avatar: String(agentData.avatar || ''),
            model_provider: String(agentData.model_provider || 'Unknown'),
            last_active_timestamp: Number(agentData.last_active_timestamp) || Date.now(),
          };
      })

      return agents[0]
    },
  })

  return {
    agent, isPending, isError, refetch
  }
}