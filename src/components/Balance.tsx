import { bytesToBigInt, decodeEventLog, formatBlock, formatUnits } from "viem";

export function Balance({ points }) {
    const balance = points ? Number(formatUnits(points, 0)) : 0;
    return (


        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className={`mb-3 text-2xl font-semibold`}>My Rewards</h2>
            <div className="m-0 max-w-[30ch] text-xl opacity-50 text-xl">
                {points ? (
                    <p>
                        {Number(formatUnits(points, 0))}{" "}
                        PTS
                    </p>

                ) : (
                    <p>0 PTS</p>
                )}
                <button>Redeem</button>
            </div>
        </div>
    )
}


// export function Balance({ points }) {
//     const balance = points ? Number(formatUnits(points, 0)) : 0;
//     return (
//         <div className="group rounded-lg border px-0.5 py-0.5 transition-colors mb-4 bg-gradient-to-r from-[#DB27A7] from-14% via-[#336FFF] via-14% via-[#0367ff] via-14% via-[#E78DFF] via-14% via-[#16D00D] via-14% via-[#FDC161] via-14% to-[#f9d208] to-16% p-0">
//             <div className="m-0 max-w-[30ch] text-xl bg-white w-full rounded border text-base py-4">
//                 <p className="text-base">{`Balance: ${balance} $DRIP`}</p>
//             </div>
//         </div>
//     )
// }