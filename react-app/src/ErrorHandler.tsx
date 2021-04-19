import React, {createContext, useState} from "react";

interface NotificationHandler {
  notification;
  setNotification;
}

const NotificationHandlerContext = createContext<NotificationHandler>({notification: null, setNotification: null})
const NotificationHandlerProvider = (props) => {
  const [notification, setNotification] = useState<any>(null);
  const handler: NotificationHandler = {notification: notification, setNotification: setNotification}
  return (<NotificationHandlerContext.Provider value={handler}>{props.children}</NotificationHandlerContext.Provider>)
}
export {NotificationHandlerContext, NotificationHandlerProvider};
