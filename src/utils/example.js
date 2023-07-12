export function convertTo24Hour(timeStr) {
    const parts = timeStr.split(' ');
    if (parts.length !== 2) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    let [time, modifier] = timeStr.split(' ');
    time = time.replace(/:/g, '');

    if (modifier.toLowerCase() === 'pm') {
        let hour = parseInt(time.slice(0, 2), 10);
        if (hour < 12) {
            hour += 12;
        } else if (hour === 12) {
            hour = 0;
        }
        time = hour.toString().padStart(2, '0') + time.slice(2);
    } else if (modifier.toLowerCase() === 'am') {
        if (time.startsWith('12')) {
            time = '00' + time.slice(2);
        }
    } else {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    return time.slice(0, 2) + ':' + time.slice(2, 4) + ':00Z';
}





export function convertTo12Hour(timeString) {
    const [hour, minute] = timeString.split(':').map(Number);
    let period = 'AM';

    if(hour > 12){
        hour -= 12;
        period = 'PM';
    } else if(hour === 12){
        period = 'PM';
    } else if(hour === 0) { // midnight
        hour = 12;
    }

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}${period}`;
}

router.post('/search', async (req, res) => {
    try {
        const userAddress = req.body.userAddress;
        const startTime = req.body.start_time;
        const endTime = req.body.end_time;
        const day = req.body.day;

        console.log(1)
        console.log(`User Address: ${userAddress}`);
        console.log(`Day: ${day}`);
        console.log(`Start Time: ${startTime}`);
        console.log(`End Time: ${endTime}`);

        const requestedStartTime = new Date("1970-01-01T" + convertTo24Hour(startTime) + "Z");
        const requestedEndTime = new Date("1970-01-01T" + convertTo24Hour(endTime) + "Z");

        // Get all providers with their locations and availabilities
        const providers = await prisma.provider.findMany({
            include: {
                provider_location: true,
                provider_avalibility: true
            }
        });

        // Filter the providers based on their travel distance, day and time availability
        const filteredProviders = [];
        for (const provider of providers) {
            let isProviderAvailable = provider.provider_avalibility.some(avail => {
                let providerStartTime = new Date("1970-01-01T" + convertTo24Hour(avail.start_at) + "Z");
                let providerEndTime = new Date("1970-01-01T" + convertTo24Hour(avail.end_at) + "Z");

                if(requestedStartTime >= providerStartTime && requestedEndTime <= providerEndTime){
                    let startTimeString = requestedStartTime.toISOString().split('T')[1].slice(0, 5);
                    let endTimeString = requestedEndTime.toISOString().split('T')[1].slice(0, 5);
                    avail.start_at = convertTo12Hour(startTimeString);
                    avail.end_at = convertTo12Hour(endTimeString);
                    return true;
                }
                return false;
            });

            if(isProviderAvailable){
                for (const location of provider.provider_location) {
                    console.log(`Calculating distance between ${userAddress} and ${location.address}`);
                    const distance = await calculateDistance(userAddress, location.address);
                    console.log(`Distance: ${distance}, Travel Distance: ${location.travel_distance}`);
                    if (distance <= location.travel_distance) {
                        filteredProviders.push(provider);
                        break;
                    }
                }
            }
        }
        console.log(2)
        console.log(filteredProviders);
        return res.json(filteredProviders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.toString() });
    }
});