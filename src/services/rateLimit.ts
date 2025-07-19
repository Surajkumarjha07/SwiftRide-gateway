
class RateLimit {
    capacity: number;
    refill_time: number;
    tokens: number;

    constructor(capacity: number, refill_time: number) {
        this.capacity = capacity;
        this.refill_time = refill_time;
        this.tokens = capacity;
        this.refillToken()
    }

    removeToken = () => {
        if (this.tokens > 0) {
            this.tokens--;
            return true;
        }

        else {
            return false;
        }
    }

    refillToken = () => {
        setInterval(() => {
            if (this.tokens < this.capacity) {
                this.tokens++;
            }
        }, this.refill_time);
    }

}

export default RateLimit;