import ApolloClient from 'apollo-boost'
import {ApolloProvider} from "vue-apollo";

enum Interval
{
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
}

const baseURL: string = 'https://tpwtp.com/api/v2';

export const v2Client = new ApolloClient({
    uri: baseURL
})

export const v2Provider = new ApolloProvider({
    defaultClient: v2Client
})
