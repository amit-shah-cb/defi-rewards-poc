import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // Get the address from query parameters
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const response = await fetch(`https://api.wallet.coinbase.com/rpc/v2/getPublicProfilesByAddresses?queryAddresses=${address}`);
    try {
        const { result } = await response.json()
        const ens = result.profiles.find(profile => !!profile.ensDomainProfile?.name)

        if (ens) {
            const avatar = await getAvatar(ens.subdomainProfile?.profileTextRecords?.avatar)
            return Response.json({ profile: ens.ensDomainProfile.name, avatar })
        }
        const cbId = result.profiles.find(profile => !!profile.subdomainProfile?.name)
        if (cbId) {
            const avatar = await getAvatar(cbId.subdomainProfile?.profileTextRecords?.avatar)
            return Response.json({ profile: cbId.subdomainProfile.name, avatar })
        }
        return Response.json({ profile: address })
    } catch (e) {
        return Response.json({ profile: address })
    }
}


async function getAvatar(avatar: string) {
    if (!avatar) return ''
    const { chainId, contractAddress, tokenId } = parseEIP155(avatar)
    try {
        const response = await fetch(`https://api.wallet.coinbase.com/rpc/v2/collectibles/getTokenDetails?chainId=${chainId}&contractAddress=${contractAddress}&tokenId=${tokenId}`)
        const { result } = await response.json()
        return result.imageUrl
    }
    catch (e) {
        return ''
    }
}

function parseEIP155(eip155String: string) {
    const nftInfo = eip155String.split(':');
    return {
        contractAddress: nftInfo[2].split('/')[0],
        tokenId: nftInfo[2].split('/')[1],
        chainId: nftInfo[1].split('/')[0],
    };
};