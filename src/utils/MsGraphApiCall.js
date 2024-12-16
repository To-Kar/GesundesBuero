const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};

export async function callMsGraph(accessToken) {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${accessToken}`);

    const options = {
        method: 'GET',
        headers: headers
    };

    try {
        const response = await fetch(graphConfig.graphMeEndpoint, options);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}