import { FC, useEffect, useState } from "react";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { REACTIONS_GRAPHQL_URI } from "../Config";
import { UserFlow } from "./user.flow";

interface UserFlowListProps {
    address: string
}

export const UserStakedList: FC<UserFlowListProps> = ({ address }) => {
    const [flows, setFlows] = useState([]);

    useEffect(() => {
        getFlows(address);
    }, []);

    async function getFlows(userAddress: string){
        const flowsQuery = `
            query($userAddress: Bytes!) {
                flows(
                    where: ({recipient: $userAddress}) {
                        sum
                        flowRate
                        lastUpdate
                        token {
                            id
                            name
                            symbol
                            underlyingAddress
                        }
                    }
                }
            }
        `;

        const client = new ApolloClient({
            uri: REACTIONS_GRAPHQL_URI,
            cache: new InMemoryCache()
        });

        const data = await client.query({query: gql(flowsQuery), variables: {'userAddress': userAddress.toLowerCase()}});
        setFlows(data.data.stakes);
    }

    return (
        <ul>
            {flows && flows.map((f,i) => <UserFlow flow={f} key={`UserFlow-${i}`} />)}
        </ul>
    )
};
