import { useCallback, useEffect, useState } from "react";

type Time = {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}
const initialTimeLeft: Time = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
};
export function SpinButton({ isSubmitting, claimable, submitLootboxClaim, claimedTime, claimCooldown }) {

    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

    const calculateTimeLeft = useCallback(() => {
        const targetDate = new Date((claimedTime + claimCooldown) * 1000);
        const difference = +targetDate - +new Date();

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        return initialTimeLeft;
    }, [claimedTime, claimCooldown]);

    useEffect(() => {
        let timer;
        if (claimedTime && claimCooldown && !claimable) {
            timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
        }
        if (claimable) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [claimCooldown, claimedTime, claimable]);

    const formatTime = (time: number) => {
        return time.toString().padStart(2, '0');
    }
    const isNotInitialTimeLeft = (time: Time) => {
        return time.days != initialTimeLeft.days || time.hours != initialTimeLeft.hours || time.minutes != initialTimeLeft.minutes || time.seconds != initialTimeLeft.seconds;
    }

    const getButtonMessage = () => {
        if (!claimable && claimedTime != null && claimCooldown != null) {
            if (!isNotInitialTimeLeft(timeLeft)) {
                return <span className="loading loading-spinner"></span>
            }
            return `🔒 ${formatTime(timeLeft.days)}:${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)} 🔒`;
        }
        return "Spin the wheel";
    }

    return (<div className="group rounded-lg border px-0.5 py-0.5 transition-colors mb-4 bg-gradient-to-r from-[#DB27A7] from-2% via-[#336FFF] via-14% via-[#0367ff] via-14% via-[#E78DFF] via-14% via-[#16D00D] via-14% via-[#FDC161] via-14% to-[#f9d208] to-16% p-0 mt-4">
        <button className="btn btn-block border rounded text-white disabled:bg-black disabled:text-white" disabled={!claimable} onClick={submitLootboxClaim}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : getButtonMessage()}
        </button>
    </div>)

}