import { bytesToBigInt, decodeEventLog, formatBlock, formatUnits } from "viem";

export function Balance({ points }) {
    const balance = points ? Number(formatUnits(points, 0)) : 0;
    const onClickRedeem = () => {
        window.open("https://shop.slice.so/store/1548", "_blank");
    }
    return (
        <div className="mb-4" >
            <h2 className={`mb-3 text-lg font-semibold`}>MY REWARDS</h2>
            <div className="flex justify-center items-center gap-2">
                <div className="m-0 max-w-[30ch] flex items-center gap-2 justify-center">
                    <div>
                        <p>
                             <span className="text-5xl">{balance}</span>
                        </p>
                    </div>
                </div> 
                 <div className="m-0 max-w-[30ch] flex items-end gap-2 justify-center">
                    <div>
                        <p>
                             <span className="opacity-50 text-sm">$DRIP</span>                             
                        </p>
                    </div>
                    <button className="btn bg-[#001ad9] btn-xs text-white rounded" onClick={onClickRedeem} >REDEEM
                        <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 10.5H2V4H5.67L7.17 2.5H0.5V12H10V5.33L8.5 6.83V10.5Z" fill="#FFFFFF" />
                            <path d="M7.49997 0V1.5H9.93997L4.46997 6.97L5.52997 8.03L11 2.56V5H12.5V0H7.49997Z" fill="#FFFFFF" />
                        </svg>
                    </button>  
                </div>    
            </div>                      
        </div>
    )
}
