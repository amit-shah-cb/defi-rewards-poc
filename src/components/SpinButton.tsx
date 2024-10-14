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

    return (
        <button className="btn btn-block border border-[#3773F5] rounded text-white disabled:bg-[#3773F5] disabled:text-white bg-[#3773F5] font-typewriter" disabled={!claimable} onClick={submitLootboxClaim}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : getButtonMessage()}
        </button>
    )

}