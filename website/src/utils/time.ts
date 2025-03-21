
import dayjs from 'dayjs';

export function formatDate (timestamp: number = 0): string {
return dayjs(timestamp).format(
    'MMMM DD, YYYY HH:mm:ss'
    )
}