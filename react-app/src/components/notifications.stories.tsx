import { Notification } from './notification';

export default {
    title: 'Components/Notifications'
}

export const Notifications = () => {
    return (
        <div className="space-y-4">
            <Notification />
            <Notification type="warning" />
            <Notification type="info" />
            <Notification type="error" />
            <Notification type="custom" />
        </div>
    )
}
