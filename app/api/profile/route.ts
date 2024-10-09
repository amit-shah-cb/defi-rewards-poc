import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest } from 'next/server';

// export default async function GET(req: NextApiRequest, res: NextApiResponse) {
//     const { address } = req.query
//     const response = await fetch(`https://api.wallet.coinbase.com/rpc/v2/getPublicProfilesByAddresses?queryAddresses=${address}`);
//     const data = await response.json();
//     return Response.json(data)
// }

export async function GET(request: NextRequest) {
    // Get the address from query parameters
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const response = await fetch(`https://api.wallet.coinbase.com/rpc/v2/getPublicProfilesByAddresses?queryAddresses=${address}`);
    try {
        const { result } = await response.json()
        const ens = result.profiles.find(profile => !!profile.ensDomainProfile?.name)
        console.log(ens)
        if (ens) {
            return Response.json({ profile: ens.ensDomainProfile.name })
        }
        const cbId = result.profiles.find(profile => !!profile.subdomainProfile?.name)
        if (cbId) {
            return Response.json({ profile: cbId.subdomainProfile.name })
        }
        return Response.json({ profile: address })
    } catch (e) {
        return Response.json({ profile: address })
    }
}