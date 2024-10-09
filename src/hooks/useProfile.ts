import { useEffect, useState } from "react";

export async function getProfile(address: string) {
    const response = await fetch(`/api/profile?address=${address}`);
    const data = await response.json();
    return data;
}

export function useProfile(address: string) {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        getProfile(address).then(data => {
            setProfile(data.profile)
        });
    }, [address]);

    return profile;
}