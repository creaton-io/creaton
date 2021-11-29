import { FC, useEffect, useState } from "react";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { APOLLO_URI } from "../Config";
import { UserStaked } from "./user.staked";

interface UserStakedListProps {
    address: string
}

export const UserStakedList: FC<UserStakedListProps> = ({ address }) => {
    const [stakes, setStakes] = useState([]);

    useEffect(() => {
        getStakes(address);
    }, []);

    async function getStakes(userAddress: string){
        const reactionsQuery = `
            query($userAddress: Bytes!) {
                stakes(where: {user: $userAddress}) {
                    id
                    token
                    amount
                    reaction {
                        nft
                        tokenId
                        reaction {
                            contract
                            name
                            symbol
                        }
                    }
                }
            }
        `;

        const client = new ApolloClient({
            uri: APOLLO_URI,
            cache: new InMemoryCache()
        });

        const data = await client.query({query: gql(reactionsQuery), variables: {'userAddress': userAddress.toLowerCase()}});
        setStakes(data.data.stakes);
    }

    return (
        <ul>
            {stakes && stakes.map((s,i) => <UserStaked stake={s} key={`UserStaked-${i}`} />)}
        </ul>
    )
};
