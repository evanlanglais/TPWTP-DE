import ApolloClient from "apollo-client";
import {ApolloProvider} from "vue-apollo";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";

const baseURL: string = 'http://localhost:8080/v2';

const httpLink = createHttpLink({
    uri: baseURL,
});

const cache = new InMemoryCache();
export const v2Client = new ApolloClient({
    link: httpLink,
    cache
})

export const v2Provider = new ApolloProvider({
    defaultClient: v2Client
})
